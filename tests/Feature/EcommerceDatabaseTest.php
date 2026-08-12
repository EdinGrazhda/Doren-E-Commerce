<?php

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\StorefrontBanner;
use App\Models\User;
use App\OrderStatus;
use App\PaymentStatus;
use Database\Seeders\AdminUserSeeder;
use Database\Seeders\ProductCatalogSeeder;
use Database\Seeders\StorefrontBannerSeeder;
use Illuminate\Support\Facades\Schema;

test('ecommerce tables include indexes for catalog and order workflows', function () {
    expect(Schema::hasIndex('products', ['product_category_id', 'is_active', 'sort_order']))->toBeTrue()
        ->and(Schema::hasIndex('products', ['is_active', 'is_featured', 'sort_order']))->toBeTrue()
        ->and(Schema::hasIndex('product_variants', ['product_id', 'is_active', 'sort_order']))->toBeTrue()
        ->and(Schema::hasIndex('orders', ['status', 'created_at']))->toBeTrue()
        ->and(Schema::hasIndex('orders', ['customer_email', 'created_at']))->toBeTrue()
        ->and(Schema::hasIndex('order_items', ['order_id', 'product_id']))->toBeTrue()
        ->and(Schema::hasIndex('storefront_banners', ['position', 'is_active', 'sort_order']))->toBeTrue()
        ->and(Schema::hasIndex('users', ['is_admin']))->toBeTrue();
});

test('production seeders create an admin account and starter catalog', function () {
    $this->seed([
        AdminUserSeeder::class,
        StorefrontBannerSeeder::class,
        ProductCatalogSeeder::class,
    ]);

    $admin = User::where('email', 'admin@doren.test')->firstOrFail();
    $products = Product::query()
        ->select(['id', 'product_category_id', 'name', 'slug', 'is_active', 'is_featured'])
        ->with([
            'category:id,name,slug',
            'variants:id,product_id,sku,size,color_name,stock_quantity,is_active',
        ])
        ->where('is_active', true)
        ->get();

    expect($admin->is_admin)->toBeTrue()
        ->and(ProductCategory::count())->toBe(4)
        ->and(StorefrontBanner::count())->toBe(3)
        ->and($products)->toHaveCount(4)
        ->and($products->first()->relationLoaded('category'))->toBeTrue()
        ->and($products->first()->relationLoaded('variants'))->toBeTrue()
        ->and(ProductVariant::where('stock_quantity', '>', 0)->count())->toBeGreaterThan(0);
});

test('guest orders store customer details and item snapshots without a user account', function () {
    $product = Product::factory()
        ->has(ProductVariant::factory()->state([
            'sku' => 'DRN-TEST-M-OLIVE',
            'size' => 'M',
            'color_name' => 'Olive',
            'color_hex' => '#4e5738',
            'stock_quantity' => 12,
        ]), 'variants')
        ->create([
            'name' => 'Organic Cotton Polo',
            'price_cents' => 8900,
        ]);

    $variant = $product->variants()->firstOrFail();
    $order = Order::factory()->create([
        'customer_first_name' => 'Ada',
        'customer_last_name' => 'Lovelace',
        'customer_email' => 'ada@example.com',
        'status' => OrderStatus::Pending,
        'payment_status' => PaymentStatus::Pending,
        'subtotal_cents' => 17800,
        'shipping_cents' => 0,
        'tax_cents' => 0,
        'discount_cents' => 0,
        'total_cents' => 17800,
    ]);

    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'variant_name' => $variant->color_name.' / '.$variant->size,
        'sku' => $variant->sku,
        'unit_price_cents' => $product->price_cents,
        'quantity' => 2,
        'line_total_cents' => 17800,
        'product_options' => [
            'color' => $variant->color_name,
            'size' => $variant->size,
        ],
    ]);

    $orderWithItems = Order::query()
        ->with(['items.product:id,name', 'items.variant:id,sku,size,color_name'])
        ->firstOrFail();

    $this->assertModelExists($item);

    expect($orderWithItems->customer_email)->toBe('ada@example.com')
        ->and($orderWithItems->status)->toBe(OrderStatus::Pending)
        ->and($orderWithItems->payment_status)->toBe(PaymentStatus::Pending)
        ->and($orderWithItems->items)->toHaveCount(1)
        ->and($orderWithItems->items->first()->product_name)->toBe('Organic Cotton Polo')
        ->and($orderWithItems->items->first()->product_options)->toMatchArray([
            'color' => 'Olive',
            'size' => 'M',
        ]);
});
