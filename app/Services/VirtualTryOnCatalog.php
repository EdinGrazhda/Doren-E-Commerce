<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;

class VirtualTryOnCatalog
{
    public function enabled(): bool
    {
        if (! config('virtual-try-on.enabled')) {
            return false;
        }

        return config('virtual-try-on.driver') === 'service'
            && filled(config('virtual-try-on.token'));
    }

    public function category(Product $product): ?string
    {
        $overrides = config('virtual-try-on.products', []);
        $categories = config('virtual-try-on.categories', []);
        $category = $overrides[$product->slug]['category'] ?? $categories[$product->category?->slug] ?? null;

        return in_array($category, ['tops', 'bottoms', 'one-pieces'], true) ? $category : null;
    }

    public function photoType(Product $product): string
    {
        $overrides = config('virtual-try-on.products', []);

        return ($overrides[$product->slug]['garment_photo_type'] ?? config('virtual-try-on.garment_photo_type')) === 'flat-lay'
            ? 'flat-lay' : 'model';
    }

    public function image(ProductVariant $variant): ?string
    {
        return $variant->images->first()?->image_url ?: $variant->image_url;
    }
}
