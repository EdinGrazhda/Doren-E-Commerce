<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\StorefrontBanner;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __invoke(): Response
    {
        $categories = ProductCategory::query()
            ->select(['id', 'name', 'slug', 'description'])
            ->where('is_visible', true)
            ->with([
                'products' => fn ($query) => $query
                    ->select(['id', 'product_category_id', 'name', 'slug', 'primary_image_url', 'sort_order'])
                    ->where('is_active', true)
                    ->orderBy('sort_order')
                    ->limit(1),
            ])
            ->orderBy('sort_order')
            ->limit(4)
            ->get()
            ->map(fn (ProductCategory $category): array => [
                'id' => $category->id,
                'name' => $category->name,
                'slug' => $category->slug,
                'description' => $category->description,
                'image_url' => $category->products->first()?->primary_image_url,
            ]);

        $products = Product::query()
            ->select([
                'id',
                'product_category_id',
                'name',
                'slug',
                'description',
                'price_cents',
                'currency',
                'primary_image_url',
                'is_featured',
                'sort_order',
            ])
            ->with([
                'category:id,name,slug',
                'variants:id,product_id,color_name,color_hex,stock_quantity,is_active,sort_order',
            ])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->limit(12)
            ->get()
            ->map(fn (Product $product): array => $this->productPayload($product));

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
                'sort_order',
            ])
            ->where('is_active', true)
            ->whereIn('position', StorefrontBanner::Positions)
            ->orderBy('position')
            ->orderBy('sort_order')
            ->get()
            ->unique('position')
            ->mapWithKeys(fn (StorefrontBanner $banner): array => [
                $banner->position => $this->bannerPayload($banner),
            ]);

        return Inertia::render('welcome', [
            'banners' => $banners,
            'categories' => $categories,
            'newInProducts' => $products->take(6)->values(),
            'bestSellerProducts' => $products
                ->filter(fn (array $product): bool => $product['is_featured'])
                ->whenEmpty(fn (Collection $collection): Collection => $products->take(6))
                ->take(6)
                ->values(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Product $product): array
    {
        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'description' => $product->description,
            'price_cents' => $product->price_cents,
            'currency' => $product->currency,
            'image_url' => $product->primary_image_url,
            'is_featured' => $product->is_featured,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'colors' => $product->variants
                ->where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->unique('color_hex')
                ->take(4)
                ->map(fn ($variant): array => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex ?: '#d9cfbd',
                ])
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function bannerPayload(StorefrontBanner $banner): array
    {
        return [
            'id' => $banner->id,
            'position' => $banner->position,
            'eyebrow' => $banner->eyebrow,
            'title' => $banner->title,
            'subtitle' => $banner->subtitle,
            'body' => $banner->body,
            'primary_action_label' => $banner->primary_action_label,
            'primary_action_url' => $banner->primary_action_url,
            'secondary_action_label' => $banner->secondary_action_label,
            'secondary_action_url' => $banner->secondary_action_url,
            'image_url' => $banner->image_url,
        ];
    }
}
