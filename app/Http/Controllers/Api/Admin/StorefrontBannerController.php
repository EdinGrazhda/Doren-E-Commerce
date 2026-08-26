<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStorefrontBannerRequest;
use App\Http\Requests\Admin\UpdateStorefrontBannerRequest;
use App\Models\StorefrontBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

class StorefrontBannerController extends Controller
{
    public function index(): JsonResponse
    {
        $banners = StorefrontBanner::query()
            ->select([
                'id',
                'position',
                'eyebrow',
                'title',
                'subtitle',
                'body',
                'primary_action_label',
                'primary_action_url',
                'secondary_action_label',
                'secondary_action_url',
                'image_url',
                'is_active',
                'sort_order',
                'updated_at',
            ])
            ->orderBy('position')
            ->orderBy('sort_order')
            ->paginate(15);

        return response()->json([
            'data' => [
                'banners' => $banners,
                'positions' => StorefrontBanner::Positions,
            ],
        ]);
    }

    public function store(StoreStorefrontBannerRequest $request): JsonResponse
    {
        $banner = StorefrontBanner::create($this->bannerAttributes($request));

        return response()->json([
            'data' => $banner,
            'message' => 'Banner created.',
        ], 201);
    }

    public function update(UpdateStorefrontBannerRequest $request, StorefrontBanner $banner): JsonResponse
    {
        $banner->update($this->bannerAttributes($request));

        return response()->json([
            'data' => $banner->fresh(),
            'message' => 'Banner updated.',
        ]);
    }

    public function destroy(StorefrontBanner $banner): JsonResponse
    {
        $banner->delete();

        return response()->json(['message' => 'Banner deleted.']);
    }

    /**
     * @return array<string, mixed>
     */
    private function bannerAttributes(StoreStorefrontBannerRequest|UpdateStorefrontBannerRequest $request): array
    {
        $attributes = $request->validated();

        if ($request->hasFile('image_upload')) {
            $path = $request->file('image_upload')->store('storefront-banners', 'public');
            $attributes['image_url'] = Storage::disk('public')->url($path);
        }

        unset($attributes['image_upload']);

        return $attributes;
    }
}
