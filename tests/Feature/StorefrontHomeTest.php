<?php

use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\StorefrontBanner;
use Database\Seeders\ProductCatalogSeeder;
use Database\Seeders\StorefrontBannerSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('storefront home renders real catalog data', function () {
    $this->seed([
        StorefrontBannerSeeder::class,
        ProductCatalogSeeder::class,
    ]);

    expect(Product::count())->toBe(24)
        ->and(ProductVariant::count())->toBe(276);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('banners.top.body', 'Complimentary shipping on orders over $150')
            ->where('banners.hero.0.title', 'Timeless style. Modern man.')
            ->where('banners.bottom.title', 'Elevated Essentials For Every Day')
            ->has('categories', 4)
            ->has('categories.0', fn (Assert $page) => $page
                ->where('name', 'Polos')
                ->where('slug', 'polos')
                ->whereNot('image_url', null)
                ->etc()
            )
            ->where('newInProducts.current_page', 1)
            ->where('newInProducts.last_page', 2)
            ->where('newInProducts.per_page', 20)
            ->where('newInProducts.total', 24)
            ->has('newInProducts.data', 20)
            ->has('newInProducts.data.0', fn (Assert $page) => $page
                ->where('name', 'Pima Cotton Polo')
                ->where('price_cents', 8900)
                ->where('currency', 'USD')
                ->whereNot('image_url', null)
                ->has('colors')
                ->etc()
            )
            ->has('bestSellerProducts', 6)
            ->where('bestSellerProducts.0.is_featured', true)
        );
});

test('storefront home sends every active hero carousel slide and one fixed campaign per other position', function () {
    StorefrontBanner::factory()->create([
        'position' => 'hero',
        'title' => 'First Hero',
        'image_url' => '/storage/storefront-banners/first-hero.jpg',
        'sort_order' => 10,
    ]);

    StorefrontBanner::factory()->create([
        'position' => 'hero',
        'title' => 'Second Hero',
        'image_url' => '/storage/storefront-banners/second-hero.jpg',
        'sort_order' => 20,
    ]);

    StorefrontBanner::factory()->create([
        'position' => 'top',
        'body' => 'Primary announcement',
        'sort_order' => 10,
    ]);

    StorefrontBanner::factory()->create([
        'position' => 'top',
        'body' => 'Secondary announcement',
        'sort_order' => 20,
    ]);

    StorefrontBanner::factory()->create([
        'position' => 'bottom',
        'title' => 'Inactive Campaign',
        'is_active' => false,
        'sort_order' => 5,
    ]);

    StorefrontBanner::factory()->create([
        'position' => 'bottom',
        'title' => 'Active Campaign',
        'image_url' => '/storage/storefront-banners/active-campaign.jpg',
        'sort_order' => 10,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->has('banners.hero', 2)
            ->where('banners.hero.0.title', 'First Hero')
            ->where('banners.hero.1.title', 'Second Hero')
            ->where('banners.top.body', 'Primary announcement')
            ->where('banners.bottom.title', 'Active Campaign')
        );
});

test('storefront home paginates the catalog after twenty products', function () {
    $this->seed([
        StorefrontBannerSeeder::class,
        ProductCatalogSeeder::class,
    ]);

    $this->get(route('home', ['page' => 2]))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('newInProducts.current_page', 2)
            ->where('newInProducts.last_page', 2)
            ->where('newInProducts.from', 21)
            ->where('newInProducts.to', 24)
            ->where('newInProducts.total', 24)
            ->has('newInProducts.data', 4)
        );
});

test('storefront home filters products by category', function () {
    $this->seed([
        StorefrontBannerSeeder::class,
        ProductCatalogSeeder::class,
    ]);

    $this->get(route('home', ['category' => 'shirts']))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('activeCategory.name', 'Shirts')
            ->where('activeCategory.slug', 'shirts')
            ->where('newInProducts.current_page', 1)
            ->where('newInProducts.total', 6)
            ->has('newInProducts.data', 6)
            ->where('newInProducts.data.0.name', 'Cotton Poplin Shirt')
            ->where('newInProducts.data.0.category.slug', 'shirts')
            ->has('bestSellerProducts', 3)
            ->where('bestSellerProducts.0.name', 'Cotton Poplin Shirt')
        );
});
