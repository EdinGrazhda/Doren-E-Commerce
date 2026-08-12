<?php

use Database\Seeders\ProductCatalogSeeder;
use Database\Seeders\StorefrontBannerSeeder;
use Inertia\Testing\AssertableInertia as Assert;

test('storefront home renders real catalog data', function () {
    $this->seed([
        StorefrontBannerSeeder::class,
        ProductCatalogSeeder::class,
    ]);

    $this->get(route('home'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('welcome')
            ->where('banners.top.body', 'Complimentary shipping on orders over $150')
            ->where('banners.hero.title', 'Timeless style. Modern man.')
            ->where('banners.bottom.title', 'Elevated Essentials For Every Day')
            ->has('categories', 4)
            ->has('categories.0', fn (Assert $page) => $page
                ->where('name', 'Polos')
                ->where('slug', 'polos')
                ->whereNot('image_url', null)
                ->etc()
            )
            ->has('newInProducts', 4)
            ->has('newInProducts.0', fn (Assert $page) => $page
                ->where('name', 'Pima Cotton Polo')
                ->where('price_cents', 8900)
                ->where('currency', 'USD')
                ->whereNot('image_url', null)
                ->has('colors')
                ->etc()
            )
            ->has('bestSellerProducts', 3)
            ->where('bestSellerProducts.0.is_featured', true)
        );
});
