<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Images\StoreOptimizedImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStorefrontBannerRequest;
use App\Http\Requests\Admin\UpdateStorefrontBannerRequest;
use App\Models\StorefrontBanner;
use Illuminate\Http\JsonResponse;

class StorefrontBannerController extends Controller
{
    public function __construct(private StoreOptimizedImage $storeOptimizedImage) {}

    public function index(): JsonResponse
    {
        $banners = StorefrontBanner::query()
            ->select([
                'id',
                'position',
                'title',
                'subtitle',
                'image_url',
                'updated_at',
            ])
            ->where('position', 'hero')
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->paginate(15);

        return response()->json([
            'data' => [
                'banners' => $banners,
                'bottomBanner' => StorefrontBanner::query()
                    ->select(['id', 'position', 'eyebrow', 'title', 'body', 'primary_action_label', 'primary_action_url', 'image_url', 'updated_at'])
                    ->where('position', 'bottom')
                    ->orderByDesc('is_active')
                    ->orderBy('sort_order')
                    ->first(),
            ],
        ]);
    }

    public function store(StoreStorefrontBannerRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $position = $validated['position'] ?? 'hero';

        if ($position === 'bottom') {
            abort_if(StorefrontBanner::query()->where('position', 'bottom')->exists(), 409, 'The lower banner already exists. Edit it instead.');

            $banner = StorefrontBanner::create([
                'position' => 'bottom',
                'eyebrow' => $validated['eyebrow'] ?? null,
                'title' => $validated['title'],
                'body' => $validated['body'],
                'primary_action_label' => $validated['primary_action_label'],
                'primary_action_url' => $validated['primary_action_url'],
                'image_url' => $this->storeOptimizedImage->handle($request->file('image_upload'), 'storefront-banners'),
                'is_active' => true,
                'sort_order' => 10,
            ]);

            return response()->json(['data' => $banner, 'message' => 'Lower banner created.'], 201);
        }

        $lastSortOrder = StorefrontBanner::query()
            ->where('position', 'hero')
            ->max('sort_order');

        $banner = StorefrontBanner::create([
            'position' => 'hero',
            'title' => $validated['title'],
            'subtitle' => $validated['subtitle'],
            'image_url' => $this->storeOptimizedImage->handle($request->file('image_upload'), 'storefront-banners'),
            'is_active' => true,
            'sort_order' => ((int) $lastSortOrder) + 10,
        ]);

        return response()->json([
            'data' => $banner,
            'message' => 'Banner created.',
        ], 201);
    }

    public function update(UpdateStorefrontBannerRequest $request, StorefrontBanner $banner): JsonResponse
    {
        abort_unless(in_array($banner->position, ['hero', 'bottom'], true), 404);

        $banner->update($this->bannerAttributes($request));

        return response()->json([
            'data' => $banner->fresh(),
            'message' => 'Banner updated.',
        ]);
    }

    public function destroy(StorefrontBanner $banner): JsonResponse
    {
        abort_unless($banner->position === 'hero', 404);

        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function bannerAttributes(UpdateStorefrontBannerRequest $request): array
    {
        $attributes = $request->validated();
        unset($attributes['position']);
        $attributes['is_active'] = true;

        if ($request->hasFile('image_upload')) {
            $attributes['image_url'] = $this->storeOptimizedImage->handle(
                $request->file('image_upload'),
                'storefront-banners',
            );
        }

        unset($attributes['image_upload']);

        return $attributes;
    }
}
