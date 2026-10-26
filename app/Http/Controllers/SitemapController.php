<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use App\Services\SeoMetadata;
use Generator;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SitemapController extends Controller
{
    public function __construct(private readonly SeoMetadata $seoMetadata) {}

    public function __invoke(): StreamedResponse
    {
        $pageSize = max(1, min(10000, (int) config('seo.sitemap.page_size', 10000)));
        $counts = $this->sectionCounts();
        $urlCount = array_sum($counts);

        return response()->stream(function () use ($counts, $pageSize, $urlCount): Generator {
            yield '<?xml version="1.0" encoding="UTF-8"?>'."\n";

            if ($urlCount > $pageSize) {
                yield '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

                foreach ($counts as $section => $count) {
                    for ($page = 1; $page <= (int) ceil($count / $pageSize); $page++) {
                        $path = route('sitemap.section', ['section' => $section, 'page' => $page], false);
                        yield '  <sitemap><loc>'.htmlspecialchars($this->seoMetadata->absoluteUrl($path), ENT_XML1, 'UTF-8').'</loc></sitemap>'."\n";
                    }
                }

                yield '</sitemapindex>'."\n";

                return;
            }

            $urls = (function () use ($counts, $pageSize): Generator {
                foreach ($counts as $section => $count) {
                    for ($page = 1; $page <= (int) ceil($count / $pageSize); $page++) {
                        yield from $this->sectionUrls($section, $page, $pageSize);
                    }
                }
            })();

            yield from $this->renderUrlSet($urls);
        }, headers: ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    public function section(string $section, int $page): StreamedResponse
    {
        abort_unless(in_array($section, ['home', 'collections', 'products'], true), 404);
        abort_if($page < 1, 404);

        $pageSize = max(1, min(10000, (int) config('seo.sitemap.page_size', 10000)));
        $count = $this->sectionCounts()[$section] ?? 0;
        abort_if($page > max(1, (int) ceil($count / $pageSize)), 404);

        return response()->stream(function () use ($section, $page, $pageSize): Generator {
            yield from $this->renderUrlSet($this->sectionUrls($section, $page, $pageSize));
        }, headers: [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    /** @return array<string, int> */
    private function sectionCounts(): array
    {
        if (! config('seo.indexing_enabled')) {
            return ['home' => 0, 'collections' => 0, 'products' => 0];
        }

        return [
            'home' => 1,
            'collections' => ProductCategory::query()
                ->where('is_visible', true)
                ->whereHas('products', fn ($query) => $query->where('is_active', true))
                ->count(),
            'products' => Product::query()->where('is_active', true)->count(),
        ];
    }

    /**
     * @return Generator<int, string>
     */
    private function sectionUrls(string $section, int $page, int $pageSize): Generator
    {
        if ($section === 'home') {
            if (config('seo.indexing_enabled')) {
                yield $this->seoMetadata->absoluteUrl(route('home', [], false));
            }

            return;
        }

        if ($section === 'collections') {
            $categories = ProductCategory::query()
                ->select(['id', 'slug'])
                ->where('is_visible', true)
                ->whereHas('products', fn ($query) => $query->where('is_active', true))
                ->orderBy('id')
                ->forPage($page, $pageSize)
                ->cursor();

            foreach ($categories as $category) {
                yield $this->seoMetadata->absoluteUrl(route('collections.show', ['category' => $category->slug], false));
            }

            return;
        }

        $products = Product::query()
            ->select(['id', 'slug'])
            ->where('is_active', true)
            ->orderBy('id')
            ->forPage($page, $pageSize)
            ->cursor();

        foreach ($products as $product) {
            yield $this->seoMetadata->absoluteUrl(route('products.show', ['product' => $product->slug], false));
        }
    }

    /**
     * @param  iterable<string>  $urls
     * @return Generator<int, string>
     */
    private function renderUrlSet(iterable $urls): Generator
    {
        yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

        foreach ($urls as $url) {
            yield '  <url><loc>'.htmlspecialchars($url, ENT_XML1, 'UTF-8').'</loc></url>'."\n";
        }

        yield '</urlset>'."\n";
    }
}
