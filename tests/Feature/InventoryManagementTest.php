<?php

use App\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\User;
use Inertia\Testing\AssertableInertia as Assert;

test('only admins can access inventory management', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('dashboard.inventory'))
        ->assertForbidden();

    $this->actingAs($user)
        ->getJson(route('api.admin.inventory.index'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->get(route('dashboard.inventory'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('admin/inventory/index'));
});

test('only admins can access counter sales page', function () {
    $user = User::factory()->create();
    $admin = User::factory()->admin()->create();

    $this->actingAs($user)
        ->get(route('dashboard.sales'))
        ->assertForbidden();

    $this->actingAs($admin)
        ->get(route('dashboard.sales'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component('admin/sales/index'));
});

test('admins can receive stock and the product catalog reflects the new balance', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create(['stock_quantity' => 7]);

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Received->value,
            'quantity' => 12,
            'reference' => 'PO-1042',
            'note' => 'Morning delivery',
        ])
        ->assertCreated()
        ->assertJsonPath('data.balance_after', 19)
        ->assertJsonPath('data.user.id', $admin->id);

    expect($variant->fresh()->stock_quantity)->toBe(19);

    $movement = InventoryMovement::query()->firstOrFail();

    expect($movement->type)->toBe(InventoryMovementType::Received)
        ->and($movement->quantity)->toBe(12)
        ->and($movement->balance_after)->toBe(19)
        ->and($movement->reference)->toBe('PO-1042')
        ->and($movement->user_id)->toBe($admin->id);

    $this->actingAs($admin)
        ->getJson(route('api.admin.products.index'))
        ->assertSuccessful()
        ->assertJsonPath('data.products.data.0.variants.0.stock_quantity', 19);
});

test('admins can record a sale with revenue and decrement stock', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create(['stock_quantity' => 8]);

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Sold->value,
            'quantity' => 3,
            'unit_amount_cents' => 4500,
            'reference' => 'POS-2088',
        ])
        ->assertCreated()
        ->assertJsonPath('data.balance_after', 5)
        ->assertJsonPath('data.unit_amount_cents', 4500);

    expect($variant->fresh()->stock_quantity)->toBe(5);

    $movement = InventoryMovement::query()->firstOrFail();

    expect($movement->type)->toBe(InventoryMovementType::Sold)
        ->and($movement->quantity)->toBe(3)
        ->and($movement->balance_after)->toBe(5)
        ->and($movement->unit_amount_cents)->toBe(4500);
});

test('sales cannot oversell a product or create partial history', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create(['stock_quantity' => 2]);

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Sold->value,
            'quantity' => 3,
            'unit_amount_cents' => 2500,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('quantity');

    expect($variant->fresh()->stock_quantity)->toBe(2)
        ->and(InventoryMovement::query()->count())->toBe(0);
});

test('sales cannot consume stock reserved for another order', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 5,
        'reserved_quantity' => 3,
    ]);

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Sold->value,
            'quantity' => 3,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('quantity');

    expect($variant->fresh()->stock_quantity)->toBe(5)
        ->and(InventoryMovement::query()->count())->toBe(0);
});

test('inactive variants cannot be sold but can receive stock', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create([
        'stock_quantity' => 4,
        'is_active' => false,
    ]);

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Sold->value,
            'quantity' => 1,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('product_variant_id');

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Received->value,
            'quantity' => 6,
        ])
        ->assertCreated();

    expect($variant->fresh()->stock_quantity)->toBe(10);
});

test('inventory listing supports stock filters and independent pagination', function () {
    $admin = User::factory()->admin()->create();

    ProductVariant::factory()->count(16)->create(['stock_quantity' => 20]);
    ProductVariant::factory()->count(3)->create(['stock_quantity' => 3]);
    ProductVariant::factory()->count(2)->create(['stock_quantity' => 0]);
    $movementVariant = ProductVariant::factory()->create(['stock_quantity' => 20]);

    InventoryMovement::factory()->count(11)->create([
        'product_variant_id' => $movementVariant->id,
    ]);

    $this->actingAs($admin)
        ->getJson(route('api.admin.inventory.index', [
            'status' => 'low',
            'variant_page' => 1,
            'movement_page' => 2,
        ]))
        ->assertSuccessful()
        ->assertJsonPath('data.variants.total', 3)
        ->assertJsonCount(3, 'data.variants.data')
        ->assertJsonPath('data.movements.current_page', 2)
        ->assertJsonPath('data.movements.total', 11)
        ->assertJsonCount(1, 'data.movements.data')
        ->assertJsonPath('data.metrics.low_stock_count', 3)
        ->assertJsonPath('data.metrics.out_of_stock_count', 2);
});

test('inventory movements can be filtered to counter sales', function () {
    $admin = User::factory()->admin()->create();
    $variant = ProductVariant::factory()->create(['stock_quantity' => 20]);

    InventoryMovement::factory()->create([
        'product_variant_id' => $variant->id,
        'type' => InventoryMovementType::Received,
        'quantity' => 5,
    ]);
    InventoryMovement::factory()->sold()->create([
        'product_variant_id' => $variant->id,
        'quantity' => 2,
        'unit_amount_cents' => 1500,
    ]);

    $this->actingAs($admin)
        ->getJson(route('api.admin.inventory.index', ['type' => InventoryMovementType::Sold->value]))
        ->assertSuccessful()
        ->assertJsonPath('data.movements.total', 1)
        ->assertJsonPath('data.movements.data.0.type', InventoryMovementType::Sold->value)
        ->assertJsonPath('data.movements.data.0.quantity', 2);
});

test('inventory search matches product names and skus', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create(['name' => 'Canvas Field Jacket']);
    ProductVariant::factory()->for($product)->create(['sku' => 'JACKET-NAVY-M']);
    ProductVariant::factory()->create(['sku' => 'OTHER-SKU-L']);

    $this->actingAs($admin)
        ->getJson(route('api.admin.inventory.index', ['search' => 'Field Jacket']))
        ->assertSuccessful()
        ->assertJsonPath('data.variants.total', 1)
        ->assertJsonPath('data.variants.data.0.sku', 'JACKET-NAVY-M');

    $this->actingAs($admin)
        ->getJson(route('api.admin.inventory.index', ['search' => 'JACKET-NAVY']))
        ->assertSuccessful()
        ->assertJsonPath('data.variants.total', 1);
});

test('inventory movement input is strictly validated', function (array $payload, string $field) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('api.admin.inventory.store'), $payload)
        ->assertUnprocessable()
        ->assertJsonValidationErrors($field);
})->with([
    'missing variant' => [
        ['type' => 'received', 'quantity' => 1],
        'product_variant_id',
    ],
    'unknown type' => [
        ['product_variant_id' => 999999, 'type' => 'adjusted', 'quantity' => 1],
        'type',
    ],
    'zero quantity' => [
        ['product_variant_id' => 999999, 'type' => 'received', 'quantity' => 0],
        'quantity',
    ],
    'oversized reference' => [
        [
            'product_variant_id' => 999999,
            'type' => 'received',
            'quantity' => 1,
            'reference' => str_repeat('x', 81),
        ],
        'reference',
    ],
]);
