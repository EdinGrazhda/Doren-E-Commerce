<?php

test('storefront cart renders session cart items', function () {
    $this->withSession([
        'cart.items' => [
            '12' => [
                'product_id' => 7,
                'variant_id' => 12,
                'name' => 'Organic Cotton Polo',
                'slug' => 'organic-cotton-polo',
                'image_url' => 'https://example.com/polo.jpg',
                'size' => 'M',
                'color_name' => 'Olive Green',
                'color_hex' => '#4e5738',
                'quantity' => 2,
                'unit_price_cents' => 8800,
                'currency' => 'USD',
            ],
        ],
    ]);

    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cart')
            ->where('items.0.name', 'Organic Cotton Polo')
            ->where('items.0.quantity', 2)
            ->where('items.0.line_total_cents', 17600)
            ->where('subtotal_cents', 17600)
            ->where('cart.count', 2)
        );
});

test('storefront cart renders empty state', function () {
    $this->get(route('cart'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('cart')
            ->has('items', 0)
            ->where('subtotal_cents', 0)
            ->where('currency', 'USD')
            ->where('cart.count', 0)
        );
});

test('storefront cart item can be removed', function () {
    $this->withSession([
        'cart.items' => [
            '12' => [
                'product_id' => 7,
                'variant_id' => 12,
                'name' => 'Organic Cotton Polo',
                'slug' => 'organic-cotton-polo',
                'image_url' => 'https://example.com/polo.jpg',
                'size' => 'M',
                'color_name' => 'Olive Green',
                'color_hex' => '#4e5738',
                'quantity' => 2,
                'unit_price_cents' => 8800,
                'currency' => 'USD',
            ],
        ],
    ]);

    $this->from(route('cart'))
        ->delete(route('cart-items.destroy', ['variantId' => 12]))
        ->assertRedirect(route('cart'))
        ->assertSessionMissing('cart.items.12');
});
