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
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;

test('guests are redirected away from the admin panel', function () {
    $this->get(route('dashboard'))
        ->assertRedirect(route('login'));
});

test('authenticated admins are redirected from login to the admin panel', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('login'))
        ->assertRedirect(route('dashboard'));
});

test('non admin users cannot access the admin panel', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('dashboard'))
        ->assertForbidden();
});

test('admin users can view every sidebar section', function (string $routeName) {
    $admin = User::factory()->admin()->create();

    ProductCategory::factory()
        ->has(Product::factory()
            ->has(ProductVariant::factory(), 'variants'), 'products')
        ->create();

    $product = Product::with('variants')->firstOrFail();
    $variant = $product->variants->first();
    $order = Order::factory()->create();

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant?->id,
        'product_name' => $product->name,
    ]);

    $this->actingAs($admin)
        ->get(route($routeName))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page->component(match ($routeName) {
            'dashboard' => 'admin/dashboard',
            'dashboard.orders.index' => 'admin/orders/index',
            'dashboard.products.index' => 'admin/products/index',
            'dashboard.categories.index' => 'admin/categories/index',
            'dashboard.banners.index' => 'admin/banners/index',
            'dashboard.customers.index' => 'admin/customers/index',
            'dashboard.settings' => 'admin/settings/index',
        }));
})->with([
    'dashboard' => 'dashboard',
    'orders' => 'dashboard.orders.index',
    'products' => 'dashboard.products.index',
    'categories' => 'dashboard.categories.index',
    'banners' => 'dashboard.banners.index',
    'customers' => 'dashboard.customers.index',
    'settings' => 'dashboard.settings',
]);

test('admin dashboard eager loads compact order and product summaries', function () {
    $admin = User::factory()->admin()->create();

    $category = ProductCategory::factory()->create(['name' => 'Polos']);
    $product = Product::factory()
        ->for($category, 'category')
        ->has(ProductVariant::factory()->state(['stock_quantity' => 3]), 'variants')
        ->create(['is_active' => true]);

    $variant = $product->variants()->firstOrFail();
    $order = Order::factory()->create([
        'customer_email' => 'buyer@example.com',
        'total_cents' => 9900,
    ]);

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_variant_id' => $variant->id,
        'product_name' => $product->name,
        'line_total_cents' => 9900,
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->has('metrics')
            ->where('metrics.orders_count', 1)
            ->where('metrics.products_count', 1)
            ->has('recentOrders', 1)
            ->has('lowStockProducts', 1));
});

test('admin sidebar shares pending order count until orders are opened', function () {
    $admin = User::factory()->admin()->create();

    Order::factory()->create([
        'status' => OrderStatus::Pending,
    ]);
    Order::factory()->create([
        'status' => OrderStatus::Confirmed,
    ]);

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/dashboard')
            ->where('dashboard.orders.pending_count', 1)
        );

    $this->actingAs($admin)
        ->get(route('dashboard.orders.index'))
        ->assertSuccessful()
        ->assertInertia(fn (Assert $page) => $page
            ->component('admin/orders/index')
            ->where('dashboard.orders.pending_count', 0)
        );
});

test('admins can create update and delete categories', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.categories.store'), [
            'name' => 'Summer Shirts',
            'slug' => '',
            'description' => 'Warm weather shirting.',
            'is_visible' => true,
        ])
        ->assertRedirect(route('dashboard.categories.index'))
        ->assertSessionHasNoErrors();

    $category = ProductCategory::query()->where('slug', 'summer-shirts')->firstOrFail();

    expect($category->name)->toBe('Summer Shirts')
        ->and($category->is_visible)->toBeTrue();

    $this->actingAs($admin)
        ->put(route('dashboard.categories.update', $category), [
            'name' => 'Resort Shirts',
            'slug' => 'resort-shirts',
            'description' => null,
            'is_visible' => false,
        ])
        ->assertRedirect(route('dashboard.categories.index'))
        ->assertSessionHasNoErrors();

    $category->refresh();

    expect($category->name)->toBe('Resort Shirts')
        ->and($category->slug)->toBe('resort-shirts')
        ->and($category->is_visible)->toBeFalse();

    $this->actingAs($admin)
        ->delete(route('dashboard.categories.destroy', $category))
        ->assertRedirect(route('dashboard.categories.index'));

    $this->assertModelMissing($category);
});

test('admins can create update and delete storefront banners', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.banners.store'), [
            'position' => 'hero',
            'eyebrow' => 'New season',
            'title' => 'Quiet luxury essentials',
            'subtitle' => 'Refined pieces for every day.',
            'body' => null,
            'primary_action_label' => 'Shop Now',
            'primary_action_url' => '#new-in',
            'secondary_action_label' => 'Explore',
            'secondary_action_url' => '#shop-by-category',
            'image_url' => 'https://example.com/hero.jpg',
            'image_upload' => UploadedFile::fake()->image('hero.jpg', 1600, 700),
            'is_active' => true,
            'sort_order' => 15,
        ])
        ->assertRedirect(route('dashboard.banners.index'))
        ->assertSessionHasNoErrors();

    $banner = StorefrontBanner::query()->where('title', 'Quiet luxury essentials')->firstOrFail();

    expect($banner->position)->toBe('hero')
        ->and($banner->is_active)->toBeTrue()
        ->and($banner->sort_order)->toBe(15)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->put(route('dashboard.banners.update', $banner), [
            'position' => 'bottom',
            'eyebrow' => 'Spring / Summer',
            'title' => 'Elevated Essentials',
            'subtitle' => null,
            'body' => 'Designed for wherever life takes you.',
            'primary_action_label' => 'Explore',
            'primary_action_url' => '#best-sellers',
            'secondary_action_label' => null,
            'secondary_action_url' => null,
            'image_url' => null,
            'image_upload' => UploadedFile::fake()->image('bottom.webp', 1600, 700),
            'is_active' => false,
            'sort_order' => 20,
        ])
        ->assertRedirect(route('dashboard.banners.index'))
        ->assertSessionHasNoErrors();

    $banner->refresh();

    expect($banner->position)->toBe('bottom')
        ->and($banner->title)->toBe('Elevated Essentials')
        ->and($banner->is_active)->toBeFalse()
        ->and($banner->sort_order)->toBe(20)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->delete(route('dashboard.banners.destroy', $banner))
        ->assertRedirect(route('dashboard.banners.index'));

    $this->assertModelMissing($banner);
});

test('admins can create update and delete products without order history', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $category = ProductCategory::factory()->create();

    $this->actingAs($admin)
        ->post(route('dashboard.products.store'), [
            'product_category_id' => $category->id,
            'name' => 'Cotton Overshirt',
            'slug' => '',
            'sku' => 'DRN-100',
            'description' => 'Structured overshirt.',
            'price' => '129.00',
            'currency' => 'usd',
            'primary_image_url' => 'https://example.com/overshirt.jpg',
            'primary_image_upload' => UploadedFile::fake()->image('overshirt.jpg', 900, 1100),
            'is_active' => true,
            'is_featured' => false,
            'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1]),
        ])
        ->assertRedirect(route('dashboard.products.index'))
        ->assertSessionHasNoErrors();

    $product = Product::query()->where('slug', 'cotton-overshirt')->firstOrFail();

    expect($product->sku)->toBe('DRN-100')
        ->and($product->currency)->toBe('USD')
        ->and($product->price_cents)->toBe(12900)
        ->and($product->category?->is($category))->toBeTrue()
        ->and($product->primary_image_url)->toContain('/storage/products/')
        ->and($product->variants()->count())->toBe(5)
        ->and($product->variants()->where('size', 'M')->first()?->stock_quantity)->toBe(4);

    Storage::disk('public')->assertExists(Str::after($product->primary_image_url, '/storage/'));

    $this->actingAs($admin)
        ->post(route('dashboard.products.update', $product), [
            '_method' => 'put',
            'product_category_id' => null,
            'name' => 'Cotton Work Shirt',
            'slug' => 'cotton-work-shirt',
            'sku' => 'DRN-101',
            'description' => null,
            'price' => '99.00',
            'currency' => 'USD',
            'primary_image_url' => null,
            'primary_image_upload' => UploadedFile::fake()->image('work-shirt.webp', 900, 1100),
            'is_active' => false,
            'is_featured' => true,
            'variants' => variantsPayload('Navy', '#101828', [8, 9, 10, 6, 4]),
        ])
        ->assertRedirect(route('dashboard.products.index'))
        ->assertSessionHasNoErrors();

    $product->refresh();

    expect($product->name)->toBe('Cotton Work Shirt')
        ->and($product->product_category_id)->toBeNull()
        ->and($product->price_cents)->toBe(9900)
        ->and($product->is_featured)->toBeTrue()
        ->and($product->primary_image_url)->toContain('/storage/products/')
        ->and($product->variants()->where('size', 'L')->first()?->color_name)->toBe('Navy')
        ->and($product->variants()->where('size', 'L')->first()?->stock_quantity)->toBe(10);

    Storage::disk('public')->assertExists(Str::after($product->primary_image_url, '/storage/'));

    $this->actingAs($admin)
        ->delete(route('dashboard.products.destroy', $product))
        ->assertRedirect(route('dashboard.products.index'));

    $this->assertModelMissing($product);
});

test('admins cannot delete products with order history', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()->create();
    $order = Order::factory()->create();

    OrderItem::factory()->create([
        'order_id' => $order->id,
        'product_id' => $product->id,
        'product_name' => $product->name,
    ]);

    $this->actingAs($admin)
        ->delete(route('dashboard.products.destroy', $product))
        ->assertRedirect()
        ->assertSessionHasErrors('product');

    $this->assertModelExists($product);
});

test('admins can update and delete orders', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
    ]);

    $this->actingAs($admin)
        ->put(route('dashboard.orders.update', $order), [
            'status' => OrderStatus::Shipped->value,
            'payment_status' => PaymentStatus::Paid->value,
        ])
        ->assertRedirect(route('dashboard.orders.index'))
        ->assertSessionHasNoErrors();

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Shipped)
        ->and($order->payment_status)->toBe(PaymentStatus::Paid);

    $this->actingAs($admin)
        ->delete(route('dashboard.orders.destroy', $order))
        ->assertRedirect(route('dashboard.orders.index'));

    $this->assertModelMissing($order);
    $this->assertModelMissing($item);
});

/**
 * @param  array<int, int>  $quantities
 * @return array<int, array{size: string, color_name: string, color_hex: string, stock_quantity: int}>
 */
function variantsPayload(string $colorName, string $colorHex, array $quantities): array
{
    return collect(['S', 'M', 'L', 'XL', 'XXL'])
        ->map(fn (string $size, int $index): array => [
            'size' => $size,
            'color_name' => $colorName,
            'color_hex' => $colorHex,
            'stock_quantity' => $quantities[$index],
        ])
        ->all();
}
