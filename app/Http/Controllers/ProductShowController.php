<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductVariant;
use App\Services\ProductCampaignPrice;
use App\Services\VirtualTryOnCatalog;
use Inertia\Inertia;
use Inertia\Response;

class ProductShowController extends Controller
{
    public function __construct(
        private readonly ProductCampaignPrice $campaignPrice,
        private readonly VirtualTryOnCatalog $tryOnCatalog,
    ) {}

    public function __invoke(Product $product): Response
    {
        abort_unless($product->is_active, 404);

        $product->load([
            'category:id,name,slug',
            'activeCampaigns:id,name,discount_type,discount_value,starts_at,ends_at,is_active',
            'variants' => fn ($query) => $query
                ->select([
                    'id',
                    'product_id',
                    'size',
                    'color_name',
                    'color_hex',
                    'image_url',
                    'price_cents',
                    'stock_quantity',
                    'is_active',
                    'sort_order',
                ])
                ->with('images:id,product_variant_id,image_url,sort_order')
                ->where('is_active', true)
                ->orderBy('sort_order'),
        ]);

        $relatedProducts = Product::query()
            ->select([
                'id',
                'product_category_id',
                'name',
                'slug',
                'price_cents',
                'currency',
                'primary_image_url',
                'is_featured',
                'sort_order',
            ])
            ->with('variants:id,product_id,color_name,color_hex,image_url,stock_quantity,is_active,sort_order')
            ->with('activeCampaigns:id,name,discount_type,discount_value,starts_at,ends_at,is_active')
            ->where('is_active', true)
            ->whereKeyNot($product->id)
            ->when($product->category, fn ($query) => $query->whereBelongsTo($product->category, 'category'))
            ->orderBy('sort_order')
            ->limit(5)
            ->get()
            ->map(fn (Product $relatedProduct): array => $this->relatedProductPayload($relatedProduct));

        return Inertia::render('products/show', [
            'product' => $this->productPayload($product),
            'relatedProducts' => $relatedProducts,
            'tryOn' => [
                'enabled' => $this->tryOnCatalog->enabled(),
                'category' => $this->tryOnCatalog->category($product),
                'requiresGarmentImage' => true,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Product $product): array
    {
        $pricing = $this->campaignPrice->calculate($product);
        $images = collect([
            $product->primary_image_url,
            ...($product->gallery_image_urls ?? []),
        ])->filter()->values();

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'sku' => $product->sku,
            'description' => $product->description,
            'price_cents' => $pricing['price_cents'],
            'compare_at_price_cents' => $pricing['compare_at_price_cents'] ?? $product->compare_at_price_cents,
            'campaign' => $pricing['campaign'],
            'currency' => $product->currency,
            'image_url' => $product->primary_image_url,
            'images' => $images,
            'is_featured' => $product->is_featured,
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'colors' => $product->variants
                ->where('stock_quantity', '>', 0)
                ->unique('color_name')
                ->map(fn ($variant): array => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex ?: '#d9cfbd',
                    'image_url' => $this->variantImageUrls($variant)[0] ?? null,
                    'images' => $this->variantImageUrls($variant),
                ])
                ->values(),
            'sizes' => $product->variants
                ->where('stock_quantity', '>', 0)
                ->pluck('size')
                ->unique()
                ->values(),
            'variants' => $product->variants
                ->map(fn ($variant): array => [
                    'id' => $variant->id,
                    'size' => $variant->size,
                    'color_name' => $variant->color_name,
                    'color_hex' => $variant->color_hex,
                    'image_url' => $this->variantImageUrls($variant)[0] ?? null,
                    'images' => $this->variantImageUrls($variant),
                    'stock_quantity' => $variant->stock_quantity,
                    'price_cents' => $this->campaignPrice->calculate($product, $variant->price_cents ?? $product->price_cents)['price_cents'],
                ])
                ->values(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function relatedProductPayload(Product $product): array
    {
        $pricing = $this->campaignPrice->calculate($product);

        return [
            'id' => $product->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'price_cents' => $pricing['price_cents'],
            'compare_at_price_cents' => $pricing['compare_at_price_cents'],
            'campaign' => $pricing['campaign'],
            'currency' => $product->currency,
            'image_url' => $product->primary_image_url,
            'is_featured' => $product->is_featured,
            'colors' => $product->variants
                ->where('is_active', true)
                ->where('stock_quantity', '>', 0)
                ->unique('color_name')
                ->take(4)
                ->map(fn ($variant): array => [
                    'name' => $variant->color_name,
                    'hex' => $variant->color_hex ?: '#d9cfbd',
                    'image_url' => $variant->image_url,
                ])
                ->values(),
        ];
    }

    /**
     * @return array<int, string>
     */
    private function variantImageUrls(ProductVariant $variant): array
    {
        $imageUrls = $variant->relationLoaded('images')
            ? $variant->images->pluck('image_url')
            : collect();

        return $imageUrls
            ->when($imageUrls->isEmpty() && $variant->image_url, fn ($images) => $images->push($variant->image_url))
            ->filter()
            ->values()
            ->all();
    }
}
