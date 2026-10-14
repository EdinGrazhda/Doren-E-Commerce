<?php

use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Support\Facades\Mail;

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
    Mail::fake();

    $product = Product::factory()->create([
        'name' => 'Organic Cotton Polo',
        'slug' => 'organic-cotton-polo',
        'price_cents' => 8800,
        'currency' => 'EUR',
        'primary_image_url' => 'https://example.com/polo.jpg',
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
        ->and($order->customer_last_name)->toBe('Lovelace')
        ->and($order->customer_email)->toBe('ada@example.com')
        ->and($order->customer_phone)->toBe('555-0100')
        ->and($order->shipping_country_code)->toBe('XK')
        ->and($order->shipping_address_line_two)->toBeNull()
        ->and($order->customer_note)->toBeNull()
        ->and($order->total_cents)->toBe(8800)
        ->and($order->items)->toHaveCount(1)
        ->and($order->items->first()->sku)->toBe('DRN-POLO-OLV-M')
        ->and($order->items->first()->product_options['image_url'])->toBe('https://example.com/polo.jpg');

    expect($variant->fresh()->stock_quantity)->toBe(2);

    Mail::assertQueued(
        OrderConfirmation::class,
        fn (OrderConfirmation $mail): bool => $mail->hasTo('ada@example.com') && $mail->order->is($order),
    );

    $renderedEmail = (new OrderConfirmation($order))->render();

    expect($renderedEmail)
        ->toContain($order->order_number)
        ->toContain('Organic Cotton Polo')
        ->toContain('Olive Green / M')
        ->toContain('https://example.com/polo.jpg')
        ->toContain('10 Computing Lane');
});

test('storefront checkout requires contact and shipping details from supported countries', function () {
    $this->withSession(['cart.items' => ['12' => cartItem()]]);

    $this->from(route('checkout'))
        ->post(route('checkout.store'), [
            ...checkoutData(),
            'customer_name' => '',
            'customer_phone' => '',
            'shipping_country_code' => 'EU',
        ])
        ->assertRedirect(route('checkout'))
        ->assertSessionHasErrors(['customer_name', 'customer_phone', 'shipping_country_code']);

    expect(Order::query()->count())->toBe(0);
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
        'currency' => 'EUR',
        ...$overrides,
    ];
}

/**
 * @return array<string, string>
 */
function checkoutData(): array
{
    return [
        'customer_name' => 'Ada Lovelace',
        'customer_email' => 'ada@example.com',
        'customer_phone' => '555-0100',
        'shipping_street_address' => '10 Computing Lane',
        'shipping_city' => 'Prizren',
        'shipping_postal_code' => '20000',
        'shipping_country_code' => 'XK',
    ];
}
