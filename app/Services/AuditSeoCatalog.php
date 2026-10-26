<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Str;

class AuditSeoCatalog
{
    /**
     * @return array{checked_pages_count: int, issues_count: int, summary: array<string, int|bool>, findings: array<int, array{code: string, severity: string, title: string, recommendation: string, path: string|null}>}
     */
    public function run(): array
    {
        $limit = max(1, min(5000, (int) config('seo.audit.product_limit', 1000)));
        $findings = [];
        $issuesCount = 0;
        $addFinding = function (string $code, string $severity, string $title, string $recommendation, ?string $path = null) use (&$findings, &$issuesCount): void {
            $issuesCount++;

            if (count($findings) < 200) {
                $findings[] = compact('code', 'severity', 'title', 'recommendation', 'path');
            }
        };

        $this->checkConfiguration($addFinding);

        $products = Product::query()
            ->select(['id', 'name', 'slug', 'description', 'primary_image_url', 'product_category_id'])
            ->withCount(['variants as available_variants_count' => fn ($query) => $query
                ->where('is_active', true)
                ->whereColumn('stock_quantity', '>', 'reserved_quantity')])
            ->where('is_active', true)
            ->orderBy('id')
            ->limit($limit + 1)
            ->get();
        $productTruncated = $products->count() > $limit;
        $products = $products->take($limit);
        $names = [];
        $descriptions = [];

        foreach ($products as $product) {
            $path = route('products.show', ['product' => $product->slug], false);
            $name = Str::lower($this->plainText($product->name));
            $description = Str::lower($this->plainText($product->description));

            if ($name === '') {
                $addFinding('product_name_missing', 'error', 'Product name is missing', 'Add a specific product name that identifies its type and distinguishing features.', $path);
            } elseif (isset($names[$name])) {
                $addFinding('product_name_duplicate', 'warning', 'Products share the same name', 'Review the names of these products and distinguish them using verified product details.', $path);
            }

            if ($description === '') {
                $addFinding('product_description_missing', 'warning', 'Product description is missing', 'Describe the material, fit, intended use and care using verified details to answer shoppers’ questions.', $path);
            } elseif (isset($descriptions[$description])) {
                $addFinding('product_description_duplicate', 'warning', 'Products share the same description', 'Review this description and add useful details specific to this product.', $path);
            }

            if (blank($product->primary_image_url)) {
                $addFinding('product_image_missing', 'warning', 'Product image is missing', 'Upload a clear product image so the page and search previews can show the item.', $path);
            }

            if ($product->product_category_id === null) {
                $addFinding('product_category_missing', 'warning', 'Product has no collection', 'Assign a relevant collection to support browsing, internal links and a clear topic for the product.', $path);
            }

            if ($product->available_variants_count === 0) {
                $addFinding('product_no_available_variants', 'warning', 'Product has no available variants', 'Confirm that a listed product is purchasable or mark it inactive while unavailable. Product markup reports availability from current active stock.', $path);
            }

            $names[$name] = true;
            $descriptions[$description] = true;
        }

        $categories = ProductCategory::query()
            ->select(['id', 'slug', 'description'])
            ->where('is_visible', true)
            ->whereHas('products', fn ($query) => $query->where('is_active', true))
            ->orderBy('id')
            ->limit($limit + 1)
            ->get();
        $categoryTruncated = $categories->count() > $limit;
        $categories = $categories->take($limit);

        foreach ($categories as $category) {
            if ($this->plainText($category->description) === '') {
                $addFinding('collection_description_missing', 'warning', 'Collection description is missing', 'Explain what this collection offers and the questions it answers. Confirm keyword demand with connected search data before changing targeting.', route('collections.show', ['category' => $category->slug], false));
            }
        }

        return [
            'checked_pages_count' => 1 + $products->count() + $categories->count(),
            'issues_count' => $issuesCount,
            'summary' => [
                'products_checked' => $products->count(),
                'categories_checked' => $categories->count(),
                'product_limit' => $limit,
                'catalog_truncated' => $productTruncated || $categoryTruncated,
                'findings_truncated' => $issuesCount > count($findings),
            ],
            'findings' => $findings,
        ];
    }

    /** @param callable(string, string, string, string, ?string=): void $addFinding */
    private function checkConfiguration(callable $addFinding): void
    {
        $origin = parse_url((string) config('seo.canonical_url', config('app.url')));

        if (! is_array($origin) || ! isset($origin['host']) || ! in_array($origin['scheme'] ?? '', ['http', 'https'], true) || isset($origin['user']) || isset($origin['pass']) || isset($origin['query']) || isset($origin['fragment'])) {
            $addFinding('canonical_origin_invalid', 'error', 'Canonical origin is invalid', 'Set SEO_CANONICAL_URL to the public HTTP or HTTPS origin, without credentials, a query or a fragment.');
        } elseif (($origin['scheme'] ?? '') !== 'https') {
            $addFinding('canonical_https_missing', 'warning', 'Canonical origin does not use HTTPS', 'Use the verified public HTTPS origin when deploying the store. HTTP may be expected during local development.');
        }

        if (! config('inertia.ssr.enabled', false)) {
            $addFinding('ssr_disabled', 'warning', 'Server rendering is disabled', 'Enable and operate Inertia SSR in production, then verify that product content and links appear in the initial HTML response.');
        }

        if (! Route::has('sitemap')) {
            $addFinding('sitemap_route_missing', 'error', 'Sitemap route is missing', 'Restore the public sitemap route and verify the deployed XML response.');
        }

        if (! Route::has('robots') && ! is_file(public_path('robots.txt'))) {
            $addFinding('robots_missing', 'warning', 'Robots instructions are missing', 'Provide robots.txt with the public sitemap location, then verify the deployed response.');
        }
    }

    private function plainText(?string $value): string
    {
        return Str::squish(html_entity_decode(strip_tags($value ?? ''), ENT_QUOTES | ENT_HTML5, 'UTF-8'));
    }
}
