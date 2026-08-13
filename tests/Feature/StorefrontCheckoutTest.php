<?php

use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;

test('storefront checkout renders cart and form', function () {
    $this->withSession([
        'cart.items' => [
            '12' => cartItem(),
        ],
    ]);

    $this->get(route('checkout'))
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->component('checkout')
            ->where('items.0.name', 'Organic Cotton Polo')
            ->where('subtotal_cents', 8800)
            ->where('cart.count', 1)
        );
});

test('storefront checkout creates pending order from cart', function () {
    $product = Product::factory()->create([
        'name' => 'Organic Cotton Polo',
        'slug' => 'organic-cotton-polo',
        'price_cents' => 8800,
        'currency' => 'USD',
        'is_active' => true,
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'sku' => 'DRN-POLO-OLV-M',
        'size' => 'M',
        'color_name' => 'Olive Green',
        'color_hex' => '#4e5738',
        'stock_quantity' => 3,
        'is_active' => true,
    ]);

    $this->withSession([
        'cart.items' => [
            (string) $variant->id => cartItem([
                'product_id' => $product->id,
                'variant_id' => $variant->id,
            ]),
        ],
    ]);

    $this->post(route('checkout.store'), checkoutData())
        ->assertRedirect()
        ->assertSessionMissing("cart.items.{$variant->id}");

    $order = Order::query()->with('items')->firstOrFail();

    expect($order->customer_first_name)->toBe('Ada')
        ->and($order->customer_email)->toBe('ada@example.com')
        ->and($order->total_cents)->toBe(8800)
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->sku)->toBe('DRN-POLO-OLV-M');

    expect($variant->fresh()->stock_quantity)->toBe(2);
});

test('storefront checkout requires a cart', function () {
    $this->from(route('checkout'))
        ->post(route('checkout.store'), checkoutData())
        ->assertRedirect(route('checkout'))
        ->assertSessionHasErrors('cart');
});

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function cartItem(array $overrides = []): array
{
    return [
        'product_id' => 7,
        'variant_id' => 12,
        'name' => 'Organic Cotton Polo',
        'slug' => 'organic-cotton-polo',
        'image_url' => 'https://example.com/polo.jpg',
        'size' => 'M',
        'color_name' => 'Olive Green',
        'color_hex' => '#4e5738',
        'quantity' => 1,
        'unit_price_cents' => 8800,
        'currency' => 'USD',
        ...$overrides,
    ];
}

/**
 * @return array<string, string>
 */
function checkoutData(): array
{
    return [
        'customer_first_name' => 'Ada',
        'customer_last_name' => 'Lovelace',
        'customer_email' => 'ada@example.com',
        'customer_phone' => '555-0100',
        'shipping_street_address' => '10 Computing Lane',
        'shipping_address_line_two' => 'Apt 1',
        'shipping_city' => 'New York',
        'shipping_postal_code' => '10001',
        'shipping_country_code' => 'US',
        'customer_note' => 'Leave at reception.',
    ];
}
