<?php

use App\Models\Product;
use App\Models\ProductCategory;

test('sitemap lists only indexable storefront collections and products', function () {
    $visibleCategory = ProductCategory::factory()->create(['slug' => 'polos']);
    ProductCategory::factory()->create(['slug' => 'hidden', 'is_visible' => false]);
    ProductCategory::factory()->create(['slug' => 'empty']);

    $activeProduct = Product::factory()->for($visibleCategory, 'category')->create([
        'slug' => 'pima-cotton-polo',
        'is_active' => true,
    ]);
    $inactiveProduct = Product::factory()->for($visibleCategory, 'category')->create([
        'slug' => 'archived-polo',
        'is_active' => false,
    ]);

    $response = $this->get(route('sitemap'))
        ->assertSuccessful()
        ->assertHeader('Content-Type', 'application/xml; charset=UTF-8');

    $xml = simplexml_load_string($response->streamedContent());
    $locations = array_map(
        static fn (SimpleXMLElement $url): string => (string) $url->loc,
        iterator_to_array($xml->url, false),
    );

    expect($locations)->toContain(route('home').'/')
        ->toContain(route('collections.show', ['category' => $visibleCategory->slug]))
        ->toContain(route('products.show', ['product' => $activeProduct->slug]))
        ->not->toContain(route('collections.show', ['category' => 'hidden']))
        ->not->toContain(route('collections.show', ['category' => 'empty']))
        ->not->toContain(route('products.show', ['product' => $inactiveProduct->slug]));
});
