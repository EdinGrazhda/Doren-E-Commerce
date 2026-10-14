<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\ProductCategory;
use Generator;
use Illuminate\Database\Eloquent\Builder;
use Symfony\Component\HttpFoundation\StreamedResponse;

class SitemapController extends Controller
{
    public function __invoke(): StreamedResponse
    {
        return response()->stream(function (): Generator {
            yield '<?xml version="1.0" encoding="UTF-8"?>'."\n";
            yield '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'."\n";

            foreach ($this->urls() as $url) {
                yield '  <url><loc>'.htmlspecialchars($url, ENT_XML1, 'UTF-8').'</loc></url>'."\n";
            }

            yield '</urlset>'."\n";
        }, headers: ['Content-Type' => 'application/xml; charset=UTF-8']);
    }

    /** @return Generator<int, string> */
    private function urls(): Generator
    {
        yield route('home');

        foreach (ProductCategory::query()
            ->select(['id', 'slug'])
            ->where('is_visible', true)
            ->whereHas('products', fn (Builder $query) => $query->where('is_active', true))
            ->orderBy('id')
            ->cursor() as $category) {
            yield route('collections.show', ['category' => $category->slug]);
        }

        foreach (Product::query()
            ->select(['id', 'slug'])
            ->where('is_active', true)
            ->orderBy('id')
            ->cursor() as $product) {
            yield route('products.show', ['product' => $product->slug]);
        }
    }
}
