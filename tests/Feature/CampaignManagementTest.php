<?php

use App\Models\Campaign;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;

test('only admins can manage product campaigns', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($user)->get(route('dashboard.campaigns.index'))->assertForbidden();
    $this->actingAs($user)->getJson(route('api.admin.campaigns.index'))->assertForbidden();
    $this->actingAs($admin)
        ->get(route('dashboard.campaigns.index'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page->component('admin/campaigns/index'));
});

test('admin can create update and delete a campaign with products', function () {
    $admin = User::factory()->admin()->create();
    $products = Product::factory()->count(2)->create();

    $response = $this->actingAs($admin)->postJson(route('api.admin.campaigns.store'), [
        'name' => 'Autumn Sale',
        'description' => 'Selected autumn products',
        'discount_type' => 'percentage',
        'discount_value' => 20,
        'starts_at' => now()->subHour()->toISOString(),
        'ends_at' => now()->addWeek()->toISOString(),
        'is_active' => true,
        'product_ids' => $products->modelKeys(),
    ])->assertCreated()->assertJsonPath('data.products.0.id', $products[0]->id);

    $campaign = Campaign::findOrFail($response->json('data.id'));

    expect($campaign->products)->toHaveCount(2);

    $this->actingAs($admin)->putJson(route('api.admin.campaigns.update', $campaign), [
        'name' => 'Autumn Event',
        'description' => null,
        'discount_type' => 'fixed',
        'discount_value' => 1500,
        'starts_at' => null,
        'ends_at' => null,
        'is_active' => false,
        'product_ids' => [$products[0]->id],
    ])->assertSuccessful()->assertJsonPath('data.name', 'Autumn Event');

    expect($campaign->fresh()->products)->toHaveCount(1);

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.campaigns.destroy', $campaign))
        ->assertSuccessful();

    $this->assertDatabaseMissing('campaigns', ['id' => $campaign->id]);
});

test('overlapping active campaigns cannot target the same product', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $campaign = Campaign::factory()->create([
        'starts_at' => now()->subDay(),
        'ends_at' => now()->addDay(),
    ]);
    $campaign->products()->attach($product);

    $this->actingAs($admin)->postJson(route('api.admin.campaigns.store'), [
        'name' => 'Conflicting sale',
        'discount_type' => 'percentage',
        'discount_value' => 10,
        'starts_at' => now()->toISOString(),
        'ends_at' => now()->addWeek()->toISOString(),
        'is_active' => true,
        'product_ids' => [$product->id],
    ])->assertUnprocessable()->assertJsonValidationErrors('product_ids');
});

test('active campaign pricing is exposed on the storefront', function () {
    $product = Product::factory()->create(['price_cents' => 10000]);
    ProductVariant::factory()->for($product)->create(['stock_quantity' => 10]);
    $campaign = Campaign::factory()->create(['discount_value' => 25]);
    $campaign->products()->attach($product);

    $this->get(route('home'))
        ->assertSuccessful()
        ->assertInertia(fn ($page) => $page
            ->where('newInProducts.data.0.price_cents', 7500)
            ->where('newInProducts.data.0.compare_at_price_cents', 10000)
            ->where('newInProducts.data.0.campaign.name', $campaign->name)
        );
});

test('checkout recalculates campaign prices and records the discount', function () {
    $product = Product::factory()->create([
        'name' => 'Campaign Jacket',
        'price_cents' => 10000,
        'currency' => 'EUR',
    ]);
    $variant = ProductVariant::factory()->for($product)->create([
        'stock_quantity' => 5,
        'price_cents' => null,
    ]);
    $campaign = Campaign::factory()->create(['discount_value' => 20]);
    $campaign->products()->attach($product);

    $this->withSession(['cart.items' => [
        (string) $variant->id => [
            'product_id' => $product->id,
            'variant_id' => $variant->id,
            'name' => $product->name,
            'slug' => $product->slug,
            'image_url' => null,
            'size' => $variant->size,
            'color_name' => $variant->color_name,
            'color_hex' => $variant->color_hex,
            'quantity' => 2,
            'unit_price_cents' => 1,
            'currency' => 'EUR',
        ],
    ]]);

    $this->post(route('checkout.store'), campaignCheckoutData())->assertRedirect();

    $order = Order::query()->with('items')->firstOrFail();

    expect($order->subtotal_cents)->toBe(20000)
        ->and($order->discount_cents)->toBe(4000)
        ->and($order->total_cents)->toBe(16000)
        ->and($order->items->first()->unit_price_cents)->toBe(8000)
        ->and($order->items->first()->line_total_cents)->toBe(16000);
});

/** @return array<string, string> */
function campaignCheckoutData(): array
{
    return [
        'customer_first_name' => 'Ada',
        'customer_last_name' => 'Lovelace',
        'customer_email' => 'ada@example.com',
        'customer_phone' => '555-0100',
        'shipping_street_address' => '10 Computing Lane',
        'shipping_address_line_two' => '',
        'shipping_city' => 'New York',
        'shipping_postal_code' => '10001',
        'shipping_country_code' => 'US',
        'customer_note' => '',
    ];
}
