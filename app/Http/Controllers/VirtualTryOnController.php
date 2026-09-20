<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreVirtualTryOnRequest;
use App\Jobs\GenerateVirtualTryOn;
use App\Models\Product;
use App\Models\VirtualTryOn;
use App\Services\VirtualTryOnCatalog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Throwable;

class VirtualTryOnController extends Controller
{
    public function __construct(private readonly VirtualTryOnCatalog $catalog) {}

    public function store(StoreVirtualTryOnRequest $request, Product $product): JsonResponse
    {
        abort_unless($this->catalog->enabled(), 503, 'AI try-on is temporarily unavailable.');
        $category = $this->catalog->category($product);
        $variant = $product->variants()->with('images')
            ->where('is_active', true)->find($request->integer('product_variant_id'));
        $image = $variant ? $this->catalog->image($variant) : null;
        if (! $category || ! $variant || ! $image) {
            throw ValidationException::withMessages(['product_variant_id' => 'AI try-on is unavailable for this product option.']);
        }
        $owner = $request->session()->get('try_on_owner');
        if (! $owner) {
            $owner = Str::random(64);
            $request->session()->put('try_on_owner', $owner);
        }
        $ownerHash = hash('sha256', $owner);
        $active = VirtualTryOn::query()->where('owner_hash', $ownerHash)
            ->whereIn('status', ['queued', 'processing'])
            ->where('created_at', '>', now()->subMinutes(10))->exists();
        abort_if($active, 409, 'Your previous try-on is still being prepared.');

        $tryOn = VirtualTryOn::create([
            'owner_hash' => $ownerHash,
            'product_variant_id' => $variant->id,
            'category' => $category,
            'garment_photo_type' => $this->catalog->photoType($product),
            'garment_image_url' => $image,
            'expires_at' => now()->addHour(),
        ]);
        try {
            Storage::disk('try-ons')->putFileAs($tryOn->id, $request->file('photo'), 'person');
            GenerateVirtualTryOn::dispatch($tryOn->id);
        } catch (Throwable $exception) {
            Storage::disk('try-ons')->deleteDirectory($tryOn->id);
            $tryOn->delete();
            throw $exception;
        }

        return $this->payload($tryOn, 202);
    }

    public function show(Request $request, VirtualTryOn $tryOn): JsonResponse
    {
        $this->authorizeOwner($request, $tryOn);
        if (in_array($tryOn->status, ['queued', 'processing'], true) && $tryOn->created_at->lte(now()->subMinutes(10))) {
            VirtualTryOn::query()->whereKey($tryOn->id)->whereIn('status', ['queued', 'processing'])->update(['status' => 'failed']);
            $tryOn->refresh();
            if ($tryOn->status === 'failed') {
                Storage::disk('try-ons')->deleteDirectory($tryOn->id);
            }
        }

        return $this->payload($tryOn);
    }

    public function image(Request $request, VirtualTryOn $tryOn): StreamedResponse
    {
        $this->authorizeOwner($request, $tryOn);
        abort_unless($tryOn->status === 'completed' && Storage::disk('try-ons')->exists($tryOn->resultPath()), 404);

        return Storage::disk('try-ons')->response($tryOn->resultPath(), 'doren-try-on.png', [
            'Content-Type' => 'image/png', 'Cache-Control' => 'private, no-store',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function destroy(Request $request, VirtualTryOn $tryOn): Response
    {
        $this->authorizeOwner($request, $tryOn, allowExpired: true);
        $tryOn->update(['status' => 'cancelled']);
        Storage::disk('try-ons')->deleteDirectory($tryOn->id);

        return response()->noContent();
    }

    private function authorizeOwner(Request $request, VirtualTryOn $tryOn, bool $allowExpired = false): void
    {
        $owner = $request->session()->get('try_on_owner');
        abort_unless(is_string($owner) && hash_equals($tryOn->owner_hash, hash('sha256', $owner)), 404);
        abort_if(! $allowExpired && ($tryOn->expires_at->isPast() || $tryOn->status === 'cancelled'), 410);
    }

    private function payload(VirtualTryOn $tryOn, int $status = 200): JsonResponse
    {
        return response()->json(['data' => [
            'id' => $tryOn->id,
            'status' => $tryOn->status,
            'image_url' => $tryOn->status === 'completed' ? route('try-ons.image', $tryOn) : null,
            'expires_at' => $tryOn->expires_at->toIso8601String(),
        ]], $status)->header('Cache-Control', 'private, no-store');
    }
}
