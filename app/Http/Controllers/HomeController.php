<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\StorefrontBanner;
use App\Services\ProductCampaignPrice;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    public function __construct(private readonly ProductCampaignPrice $campaignPrice) {}

    public function __invoke(Request $request): Response
    {
        $activeCategory = null;
        $categorySlug = $request->string('category')->toString();
        $search = $request->string('search')->squish()->limit(100)->toString();

        if ($categorySlug !== '') {
            $activeCategory = ProductCategory::query()
                ->select(['id', 'name', 'slug'])
                ->where('is_visible', true)
                ->where('slug', $categorySlug)
                ->first();
        }

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

        $productQuery = Product::query()
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
            ->with([
                'category:id,name,slug',
                'activeCampaigns:id,name,discount_type,discount_value,starts_at,ends_at,is_active',
                'variants' => fn ($query) => $query
                    ->select(['id', 'product_id', 'color_name', 'color_hex', 'stock_quantity', 'reserved_quantity', 'sort_order'])
                    ->where('is_active', true)
                    ->whereColumn('stock_quantity', '>', 'reserved_quantity')
                    ->orderBy('sort_order'),
            ])
            ->where('is_active', true)
            ->when($activeCategory, fn ($query) => $query->whereBelongsTo($activeCategory, 'category'))
            ->when($search !== '', fn (Builder $query) => $query->where(
                fn (Builder $query) => $query
                    ->whereLike('name', "%{$search}%")
                    ->orWhereLike('sku', "%{$search}%")
                    ->orWhereLike('description', "%{$search}%")
            ))
            ->orderBy('sort_order')
            ->orderBy('id');

        $products = (clone $productQuery)
            ->paginate(20)
            ->withQueryString()
            ->fragment('new-in')
            ->through(fn (Product $product): array => $this->productPayload($product));

        $bestSellerProducts = (clone $productQuery)
            ->where('is_featured', true)
            ->limit(6)
            ->get()
            ->map(fn (Product $product): array => $this->productPayload($product));

        if ($bestSellerProducts->isEmpty()) {
            $bestSellerProducts = $products->getCollection()->take(6)->values();
        }

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
            ->map(fn (StorefrontBanner $banner): array => $this->bannerPayload($banner))
            ->groupBy('position');

        $bannerGroups = collect(StorefrontBanner::Positions)
            ->mapWithKeys(fn (string $position): array => [
                $position => $banners->get($position, collect())->values(),
            ]);

        return Inertia::render('welcome', [
            'search' => $search,
            'activeCategory' => $activeCategory ? [
                'id' => $activeCategory->id,
                'name' => $activeCategory->name,
                'slug' => $activeCategory->slug,
            ] : null,
            'banners' => [
                'top' => $bannerGroups->get('top')->first(),
                'hero' => $bannerGroups->get('hero'),
                'bottom' => $bannerGroups->get('bottom')->first(),
            ],
            'categories' => $categories,
            'newInProducts' => $products,
            'bestSellerProducts' => $bestSellerProducts,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function productPayload(Product $product): array
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
            'category' => $product->category ? [
                'id' => $product->category->id,
                'name' => $product->category->name,
                'slug' => $product->category->slug,
            ] : null,
            'colors' => $product->variants
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
