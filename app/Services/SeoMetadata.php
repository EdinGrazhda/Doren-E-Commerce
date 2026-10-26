<?php

namespace App\Services;

use Illuminate\Support\Js;
use Illuminate\Support\Str;

class SeoMetadata
{
    public function absoluteUrl(string $path): string
    {
        return $this->canonicalUrl($path);
    }

    /**
     * @param  array<string, mixed>  $props
     * @return array<int, string>
     */
    public function forStorefront(array $props): array
    {
        $category = $props['activeCategory'] ?? null;
        $search = trim((string) ($props['search'] ?? ''));
        $page = max(1, (int) request()->integer('page', 1));
        $products = $props['newInProducts'] ?? null;
        $lastPage = max(1, (int) (is_object($products) && method_exists($products, 'lastPage')
            ? $products->lastPage()
            : data_get($products, 'last_page', 1)));
        $total = (int) (is_object($products) && method_exists($products, 'total')
            ? $products->total()
            : data_get($products, 'total', 0));
        $indexable = config('seo.indexing_enabled') && $search === '' && $page <= $lastPage;

        if ($category) {
            $indexable = $indexable && $total > 0;
            $title = "Men's {$category['name']} in Kosovo | Doren";
            $description = filled($category['description'] ?? null)
                ? $category['description']
                : "Shop Doren men's ".Str::lower($category['name']).' from Prizren, Kosovo. Delivery to Kosovo, Albania and North Macedonia.';
            $path = route('collections.show', ['category' => $category['slug'], ...($page > 1 ? ['page' => $page] : [])], false);
            $structuredData = null;
        } else {
            $title = "Men's Clothing in Prizren, Kosovo | Doren";
            $description = "Shop Doren men's polos, knitwear, shirts and trousers. Based in Prizren, with delivery to Kosovo, Albania and North Macedonia.";
            $path = route('home', $page > 1 ? ['page' => $page] : [], false);
            $structuredData = [
                '@context' => 'https://schema.org',
                '@graph' => [
                    [
                        '@type' => 'WebSite',
                        '@id' => $this->canonicalUrl(route('home', [], false)).'#website',
                        'name' => config('seo.site_name'),
                        'url' => $this->canonicalUrl(route('home', [], false)),
                        'inLanguage' => config('seo.locale'),
                    ],
                    [
                        '@type' => 'Organization',
                        '@id' => $this->canonicalUrl(route('home', [], false)).'#organization',
                        'name' => config('seo.site_name'),
                        'url' => $this->canonicalUrl(route('home', [], false)),
                        'logo' => $this->publicImage('/logo/doren-black-logo-removebg-preview.png'),
                    ],
                ],
            ];
        }

        if ($search !== '') {
            $title = 'Search results | Doren Menswear';
            $description = 'Search the Doren Menswear collection.';
        }

        if ($page > 1) {
            $title .= " | Page {$page}";
        }

        $canonical = $indexable ? $this->canonicalUrl($path) : null;

        return $this->render([
            'title' => $title,
            'description' => $description,
            'canonical' => $canonical,
            'indexable' => $indexable,
            'url' => $canonical ?? $this->canonicalUrl('/'),
            'type' => 'website',
            'image' => $this->publicImage('/social-preview.png'),
            'image_alt' => 'Doren Menswear',
            'structured_data' => $structuredData,
        ]);
    }

    /**
     * @param  array<string, mixed>  $product
     * @return array<int, string>
     */
    public function forProduct(array $product): array
    {
        $title = $product['name'].' | Doren Menswear';
        $description = Str::limit(
            trim(strip_tags((string) ($product['description'] ?: 'Discover '.$product['name'].' at Doren Menswear.')))
                .' Shop Doren Menswear online from Prizren, Kosovo.',
            160,
            '…',
        );
        $path = route('products.show', ['product' => $product['slug']], false);
        $canonical = config('seo.indexing_enabled') ? $this->canonicalUrl($path) : null;
        $productImage = filled($product['image_url'] ?? null)
            ? $this->publicImage((string) $product['image_url'])
            : null;
        $shareImage = $productImage ?? $this->publicImage('/social-preview.png');
        $productSchema = [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            '@id' => $this->canonicalUrl($path).'#product',
            'name' => $product['name'],
            'sku' => $product['sku'],
            'brand' => ['@type' => 'Brand', 'name' => 'Doren'],
            'offers' => [
                '@type' => 'Offer',
                'url' => $this->canonicalUrl($path),
                'priceCurrency' => $product['currency'],
                'price' => round($product['price_cents'] / 100, 2),
                'availability' => 'https://schema.org/'.($product['is_in_stock'] ? 'InStock' : 'OutOfStock'),
            ],
        ];

        if (filled($product['description'] ?? null)) {
            $productSchema['description'] = trim(strip_tags((string) $product['description']));
        }

        if ($productImage !== null) {
            $productSchema['image'] = $productImage;
        }

        if (filled($product['category']['name'] ?? null)) {
            $productSchema['category'] = $product['category']['name'];
        }

        $breadcrumbs = [
            ['@type' => 'ListItem', 'position' => 1, 'name' => 'Home', 'item' => $this->canonicalUrl(route('home', [], false))],
        ];

        if (filled($product['category']['name'] ?? null) && filled($product['category']['slug'] ?? null)) {
            $breadcrumbs[] = [
                '@type' => 'ListItem',
                'position' => count($breadcrumbs) + 1,
                'name' => $product['category']['name'],
                'item' => $this->canonicalUrl(route('collections.show', ['category' => $product['category']['slug']], false)),
            ];
        }

        $breadcrumbs[] = ['@type' => 'ListItem', 'position' => count($breadcrumbs) + 1, 'name' => $product['name']];
        $breadcrumbs[array_key_last($breadcrumbs)]['item'] = $this->canonicalUrl($path);

        return $this->render([
            'title' => $title,
            'description' => $description,
            'canonical' => $canonical,
            'indexable' => $canonical !== null,
            'url' => $canonical ?? $this->canonicalUrl($path),
            'type' => 'product',
            'image' => $shareImage,
            'image_alt' => $product['name'],
            'structured_data' => $productSchema,
            'breadcrumb_data' => [
                '@context' => 'https://schema.org',
                '@type' => 'BreadcrumbList',
                'itemListElement' => $breadcrumbs,
            ],
        ]);
    }

    /** @return array<int, string> */
    public function forPrivateRoute(string $routeName): array
    {
        $title = match ($routeName) {
            'cart' => 'Your shopping bag | Doren Menswear',
            'checkout', 'checkout.store' => 'Secure checkout | Doren Menswear',
            'checkout.thank-you' => 'Order received | Doren Menswear',
            default => config('seo.site_name'),
        };

        return $this->render([
            'title' => $title,
            'description' => 'Shop Doren Menswear online.',
            'canonical' => null,
            'indexable' => false,
            'url' => $this->canonicalUrl('/'),
            'type' => 'website',
            'image' => $this->publicImage('/social-preview.png'),
            'image_alt' => 'Doren Menswear',
            'structured_data' => null,
        ]);
    }

    /**
     * @param  array<string, mixed>  $page
     * @return array<int, string>
     */
    private function render(array $page): array
    {
        $tags = [
            '<title>'.$this->escape($page['title']).'</title>',
            $this->meta('name', 'description', $page['description']),
            $this->meta('name', 'robots', $page['indexable'] ? 'index,follow' : 'noindex,follow'),
            $this->meta('name', 'application-name', config('seo.site_name')),
            '<meta name="apple-mobile-web-app-title" content="Doren">',
            '<meta name="theme-color" content="#050505">',
            $this->meta('property', 'og:type', $page['type']),
            $this->meta('property', 'og:site_name', config('seo.site_name')),
            $this->meta('property', 'og:title', $page['title']),
            $this->meta('property', 'og:description', $page['description']),
            $this->meta('property', 'og:url', $page['url']),
            $this->meta('property', 'og:image', $page['image']),
            $this->meta('property', 'og:image:alt', $page['image_alt']),
            '<meta name="twitter:card" content="summary_large_image">',
            $this->meta('name', 'twitter:title', $page['title']),
            $this->meta('name', 'twitter:description', $page['description']),
            $this->meta('name', 'twitter:image', $page['image']),
        ];

        if ($page['canonical']) {
            $tags[] = '<link rel="canonical" href="'.$this->escape($page['canonical']).'">';
        }

        if ($page['structured_data']) {
            $tags[] = '<script type="application/ld+json">'.Js::encode($page['structured_data']).'</script>';
        }

        if ($page['breadcrumb_data'] ?? null) {
            $tags[] = '<script type="application/ld+json">'.Js::encode($page['breadcrumb_data']).'</script>';
        }

        return $tags;
    }

    private function canonicalUrl(string $path): string
    {
        $parsedOrigin = parse_url((string) config('seo.canonical_url'));
        $parsedPath = parse_url($path);

        if (! is_array($parsedOrigin)
            || ! in_array($parsedOrigin['scheme'] ?? '', ['http', 'https'], true)
            || empty($parsedOrigin['host'])) {
            $parsedOrigin = parse_url((string) config('app.url'));
        }

        $base = $parsedOrigin['scheme'].'://'.$parsedOrigin['host'];

        if (isset($parsedOrigin['port'])) {
            $base .= ':'.$parsedOrigin['port'];
        }

        return rtrim($base, '/').($parsedPath['path'] ?? '/')
            .(isset($parsedPath['query']) ? '?'.$parsedPath['query'] : '');
    }

    private function publicImage(string $image): string
    {
        return preg_match('/^https?:\/\//i', $image) === 1
            ? $image
            : $this->canonicalUrl('/'.ltrim($image, '/'));
    }

    private function meta(string $attribute, string $name, string $content): string
    {
        return '<meta '.$attribute.'="'.$this->escape($name).'" content="'.$this->escape($content).'">';
    }

    private function escape(string $value): string
    {
        return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}
