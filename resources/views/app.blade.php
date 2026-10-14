<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    @php
        $isStorefront = $page['component'] === 'welcome';
        $product = $page['component'] === 'products/show' ? ($page['props']['product'] ?? null) : null;
        $category = $isStorefront ? ($page['props']['activeCategory'] ?? null) : null;
        $search = $isStorefront ? ($page['props']['search'] ?? '') : '';
        $pageNumber = request()->integer('page', 1);
        $pageQuery = $pageNumber > 1 ? ['page' => $pageNumber] : [];
        $canonicalUrl = $product
            ? route('products.show', ['product' => $product['slug']])
            : ($category
                ? route('collections.show', ['category' => $category['slug'], ...$pageQuery])
                : ($isStorefront ? route('home', $pageQuery) : url()->current()));

        if ($product) {
            $seoTitle = $product['name'].' | Doren Menswear';
            $seoDescription = Illuminate\Support\Str::limit(
                trim(strip_tags($product['description'] ?: 'Discover '.$product['name'].' at Doren Menswear.')).' Shop Doren Menswear online from Prizren, Kosovo.',
                160,
                '…',
            );
        } elseif ($category) {
            $seoTitle = "Men's {$category['name']} in Kosovo | Doren";
            $seoDescription = "Shop Doren men's ".Illuminate\Support\Str::lower($category['name']).' from Prizren, Kosovo. Delivery to Kosovo, Albania and North Macedonia.';
        } elseif ($isStorefront) {
            $seoTitle = "Men's Clothing in Prizren, Kosovo | Doren";
            $seoDescription = "Shop Doren men's polos, knitwear, shirts and trousers. Based in Prizren, with delivery to Kosovo, Albania and North Macedonia.";
        } else {
            $seoTitle = 'Doren Menswear';
            $seoDescription = 'Discover timeless menswear and modern essentials at Doren.';
        }

        $productImage = $product['image_url'] ?? null;
        $seoImage = $productImage
            ? (preg_match('/^https?:\/\//i', $productImage) ? $productImage : url($productImage))
            : url('/social-preview.png');
        $isIndexable = ($isStorefront && $search === '' && (! $category || ($page['props']['newInProducts']['total'] ?? 0) > 0)) || $product;

        $structuredData = $product && $productImage ? [
            '@context' => 'https://schema.org',
            '@type' => 'Product',
            'name' => $product['name'],
            'description' => strip_tags($product['description'] ?: $seoDescription),
            'image' => $seoImage,
            'sku' => $product['sku'],
            'brand' => ['@type' => 'Brand', 'name' => 'Doren'],
            'offers' => [
                '@type' => 'Offer',
                'url' => $canonicalUrl,
                'priceCurrency' => $product['currency'],
                'price' => round($product['price_cents'] / 100, 2),
            ],
        ] : ($isStorefront && ! $category && $search === '' ? [
            '@context' => 'https://schema.org',
            '@graph' => [
                ['@type' => 'WebSite', 'name' => 'Doren', 'alternateName' => 'Doren Menswear', 'url' => route('home')],
                ['@type' => 'Organization', 'name' => 'Doren Menswear', 'url' => route('home'), 'logo' => url('/logo/doren-black-logo-removebg-preview.png')],
            ],
        ] : null);
    @endphp
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: oklch(1 0 0);
            }

            html.dark {
                background-color: oklch(0.145 0 0);
            }
        </style>

        <meta name="description" content="{{ $seoDescription }}">
        @unless ($isIndexable)
            <meta name="robots" content="noindex,follow">
        @endunless
        @if ($isIndexable)
            <link rel="canonical" href="{{ $canonicalUrl }}">
        @endif
        <meta name="application-name" content="Doren Menswear">
        <meta name="apple-mobile-web-app-title" content="Doren">
        <meta name="theme-color" content="#050505">
        <meta property="og:type" content="{{ $product ? 'product' : 'website' }}">
        <meta property="og:site_name" content="Doren Menswear">
        <meta property="og:title" content="{{ $seoTitle }}">
        <meta property="og:description" content="{{ $seoDescription }}">
        <meta property="og:url" content="{{ $canonicalUrl }}">
        <meta property="og:image" content="{{ $seoImage }}">
        @unless ($productImage)
            <meta property="og:image:width" content="1200">
            <meta property="og:image:height" content="630">
        @endunless
        <meta property="og:image:alt" content="{{ $product['name'] ?? 'Doren Menswear logo' }}">
        <meta name="twitter:card" content="summary_large_image">
        <meta name="twitter:title" content="{{ $seoTitle }}">
        <meta name="twitter:description" content="{{ $seoDescription }}">
        <meta name="twitter:image" content="{{ $seoImage }}">

        @if ($structuredData)
            <script type="application/ld+json">{!! Illuminate\Support\Js::encode($structuredData) !!}</script>
        @endif

        <link rel="icon" href="/favicon.ico?v=doren" sizes="any">
        <link rel="icon" href="/favicon.svg?v=doren" type="image/svg+xml">
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=doren" sizes="180x180">
        <link rel="manifest" href="/site.webmanifest">

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $seoTitle }}</title>
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
