<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreStorefrontBannerRequest;
use App\Http\Requests\Admin\UpdateStorefrontBannerRequest;
use App\Models\StorefrontBanner;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class StorefrontBannerController extends Controller
{
    public function index(): Response
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
            ->get();

        return Inertia::render('admin/banners/index', [
            'banners' => $banners,
            'positions' => StorefrontBanner::Positions,
        ]);
    }

    public function store(StoreStorefrontBannerRequest $request): RedirectResponse
    {
        StorefrontBanner::create($this->bannerAttributes($request));

        return to_route('dashboard.banners.index');
    }

    public function update(UpdateStorefrontBannerRequest $request, StorefrontBanner $banner): RedirectResponse
    {
        $banner->update($this->bannerAttributes($request));

        return to_route('dashboard.banners.index');
    }

    public function destroy(StorefrontBanner $banner): RedirectResponse
    {
        $banner->delete();

        return to_route('dashboard.banners.index');
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
