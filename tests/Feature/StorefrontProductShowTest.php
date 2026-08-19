<?php

use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use Inertia\Testing\AssertableInertia as Assert;

test('storefront product detail renders active product data', function () {
    $category = ProductCategory::factory()->create([
        'name' => 'Polos',
        'slug' => 'polos',
    ]);
    $product = Product::factory()
        ->for($category, 'category')
        ->create([
            'name' => 'Organic Cotton Polo',
            'slug' => 'organic-cotton-polo',
            'description' => 'A refined organic cotton polo for everyday wear.',
            'price_cents' => 8800,
            'currency' => 'USD',
            'is_active' => true,
            'gallery_image_urls' => [
                'https://example.com/detail.jpg',
                'https://example.com/back.jpg',
                'https://example.com/fit.jpg',
            ],
        ]);
    ProductVariant::factory()->for($product)->create([
        'size' => 'M',
        'color_name' => 'Olive Green',
        'color_hex' => '#4e5738',
        'image_url' => 'https://example.com/olive-polo.jpg',
        'stock_quantity' => 12,
    ]);
    ProductVariant::factory()->for($product)->create([
        'size' => 'L',
        'color_name' => 'Olive Green',
        'color_hex' => '#4e5738',
        'image_url' => 'https://example.com/olive-polo.jpg',
        'stock_quantity' => 8,
    ]);
    Product::factory()
        ->for($category, 'category')
        ->create([
            'name' => 'Pima Cotton Polo',
            'slug' => 'pima-cotton-polo',
            'is_active' => true,
        ]);

    $this->get(route('products.show', $product))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('products/show')
            ->where('product.name', 'Organic Cotton Polo')
            ->where('product.slug', 'organic-cotton-polo')
            ->where('product.price_cents', 8800)
            ->where('product.category.name', 'Polos')
            ->has('product.colors', 1)
            ->where('product.colors.0.name', 'Olive Green')
            ->where('product.colors.0.image_url', 'https://example.com/olive-polo.jpg')
            ->where('product.variants.0.image_url', 'https://example.com/olive-polo.jpg')
            ->has('product.images', 4)
            ->has('product.sizes', 2)
            ->has('relatedProducts', 1)
            ->where('relatedProducts.0.name', 'Pima Cotton Polo')
        );
});

test('inactive storefront product detail is not visible', function () {
    $product = Product::factory()->create([
        'slug' => 'hidden-polo',
        'is_active' => false,
    ]);

    $this->get(route('products.show', $product))->assertNotFound();
});

test('storefront product variant can be added to cart', function () {
    $product = Product::factory()->create([
        'name' => 'Organic Cotton Polo',
        'slug' => 'organic-cotton-polo',
        'price_cents' => 8800,
        'currency' => 'USD',
        'is_active' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'size' => 'M',
        'color_name' => 'Olive Green',
        'color_hex' => '#4e5738',
        'image_url' => 'https://example.com/olive-polo.jpg',
        'stock_quantity' => 2,
        'is_active' => true,
    ]);

    $this->from(route('products.show', $product))
        ->post(route('cart-items.store'), [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])
        ->assertRedirect(route('products.show', $product))
        ->assertSessionHas("cart.items.{$variant->id}.quantity", 1)
        ->assertSessionHas("cart.items.{$variant->id}.size", 'M')
        ->assertSessionHas("cart.items.{$variant->id}.color_name", 'Olive Green')
        ->assertSessionHas("cart.items.{$variant->id}.image_url", 'https://example.com/olive-polo.jpg');

    $this->get(route('products.show', $product))
        ->assertInertia(fn (Assert $page) => $page
            ->where('cart.count', 1)
            ->etc()
        );
});

test('storefront cart rejects unavailable product variants', function () {
    $product = Product::factory()->create([
        'slug' => 'organic-cotton-polo',
        'is_active' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'stock_quantity' => 0,
        'is_active' => true,
    ]);

    $this->from(route('products.show', $product))
        ->post(route('cart-items.store'), [
            'product_variant_id' => $variant->id,
            'quantity' => 1,
        ])
        ->assertRedirect(route('products.show', $product))
        ->assertSessionHasErrors('quantity');
});
