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
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful;

test('Sanctum recognizes the current local host and port as stateful', function () {
    $request = Request::create(
        'http://127.0.0.1:8001/api/admin/dashboard',
        server: ['HTTP_REFERER' => 'http://127.0.0.1:8001/dashboard'],
    );

    expect(EnsureFrontendRequestsAreStateful::fromFrontend($request))->toBeTrue();
});

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

test('admin APIs reject guests and non admin users', function () {
    $this->getJson(route('api.admin.dashboard'))
        ->assertUnauthorized();

    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('api.admin.dashboard'))
        ->assertForbidden();

    $this->actingAs($user)
        ->postJson(route('api.admin.categories.store'), [
            'name' => 'Private category',
            'slug' => 'private-category',
            'is_visible' => true,
        ])
        ->assertForbidden();
});

test('security headers are sent with web and api responses', function () {
    $admin = User::factory()->admin()->create();

    $this->get(route('home'))
        ->assertSuccessful()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
        ->assertHeader('Content-Security-Policy', "base-uri 'self'; frame-ancestors 'none'; form-action 'self'");

    $this->actingAs($admin)
        ->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()
        ->assertHeader('X-Content-Type-Options', 'nosniff')
        ->assertHeader('X-Frame-Options', 'DENY')
        ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
        ->assertHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()')
        ->assertHeader('Content-Security-Policy', "base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
});

test('unverified admins cannot access admin pages or APIs', function () {
    $admin = User::factory()->admin()->unverified()->create();

    $this->actingAs($admin)
        ->get(route('dashboard'))
        ->assertRedirect(route('verification.notice'));

    $this->actingAs($admin)
        ->getJson(route('api.admin.dashboard'))
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
            'dashboard.inventory' => 'admin/inventory/index',
            'dashboard.sales' => 'admin/sales/index',
            'dashboard.categories.index' => 'admin/categories/index',
            'dashboard.banners.index' => 'admin/banners/index',
            'dashboard.customers.index' => 'admin/customers/index',
            'dashboard.settings' => 'admin/settings/index',
        }));
})->with([
    'dashboard' => 'dashboard',
    'orders' => 'dashboard.orders.index',
    'products' => 'dashboard.products.index',
    'inventory' => 'dashboard.inventory',
    'sales' => 'dashboard.sales',
    'categories' => 'dashboard.categories.index',
    'banners' => 'dashboard.banners.index',
    'customers' => 'dashboard.customers.index',
    'settings' => 'dashboard.settings',
]);

test('admin users can retrieve every admin API section', function (string $routeName, string $dataKey) {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->getJson(route($routeName))
        ->assertSuccessful()
        ->assertJsonPath('data', fn (array $data): bool => array_key_exists($dataKey, $data));
})->with([
    'dashboard' => ['api.admin.dashboard', 'metrics'],
    'orders' => ['api.admin.orders.index', 'orders'],
    'products' => ['api.admin.products.index', 'products'],
    'inventory' => ['api.admin.inventory.index', 'variants'],
    'categories' => ['api.admin.categories.index', 'categories'],
    'banners' => ['api.admin.banners.index', 'banners'],
    'customers' => ['api.admin.customers.index', 'customers'],
    'settings' => ['api.admin.settings.index', 'settings'],
]);

test('admin list APIs return paginated data', function (string $routeName, string $dataKey, string $section) {
    $admin = User::factory()->admin()->create();

    match ($section) {
        'orders' => Order::factory()->count(16)->create(),
        'products' => Product::factory()->count(16)->create(),
        'categories' => ProductCategory::factory()->count(16)->create(),
        'banners' => StorefrontBanner::factory()->count(16)->create(),
        'customers' => collect(range(1, 16))->each(fn (int $index) => Order::factory()->create([
            'customer_email' => "customer{$index}@example.com",
        ])),
    };

    $this->actingAs($admin)
        ->getJson(route($routeName))
        ->assertSuccessful()
        ->assertJsonPath("data.{$dataKey}.current_page", 1)
        ->assertJsonPath("data.{$dataKey}.per_page", 15)
        ->assertJsonPath("data.{$dataKey}.total", 16)
        ->assertJsonPath("data.{$dataKey}.last_page", 2)
        ->assertJsonPath("data.{$dataKey}.next_page_url", fn (?string $url): bool => filled($url))
        ->assertJsonCount(15, "data.{$dataKey}.data");

    $this->actingAs($admin)
        ->getJson(route($routeName, ['page' => 2]))
        ->assertSuccessful()
        ->assertJsonPath("data.{$dataKey}.current_page", 2)
        ->assertJsonCount(1, "data.{$dataKey}.data");
})->with([
    'orders' => ['api.admin.orders.index', 'orders', 'orders'],
    'products' => ['api.admin.products.index', 'products', 'products'],
    'categories' => ['api.admin.categories.index', 'categories', 'categories'],
    'banners' => ['api.admin.banners.index', 'banners', 'banners'],
    'customers' => ['api.admin.customers.index', 'customers', 'customers'],
]);

test('admin dashboard API returns compact order and product summaries', function () {
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
        'quantity' => 2,
        'line_total_cents' => 9900,
    ]);

    $this->actingAs($admin)
        ->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()
        ->assertJsonPath('data.metrics.orders_count', 1)
        ->assertJsonPath('data.metrics.products_count', 1)
        ->assertJsonPath('data.metrics.average_order_cents', 9900)
        ->assertJsonPath('data.metrics.pending_revenue_cents', 9900)
        ->assertJsonPath('data.metrics.units_sold_count', 2)
        ->assertJsonCount(1, 'data.recentOrders')
        ->assertJsonCount(1, 'data.lowStockProducts')
        ->assertJsonCount(7, 'data.salesSeries.week')
        ->assertJsonCount(6, 'data.salesSeries.month')
        ->assertJsonCount(5, 'data.salesSeries.year')
        ->assertJsonPath('data.salesSeries.week.6.revenue_cents', 9900)
        ->assertJsonPath('data.salesSeries.week.6.orders_count', 1)
        ->assertJsonPath('data.statusBreakdown.0.status', OrderStatus::Pending->value)
        ->assertJsonPath('data.statusBreakdown.0.count', 1)
        ->assertJsonPath('data.topProducts.0.product_name', $product->name)
        ->assertJsonPath('data.topProducts.0.revenue_cents', 9900);
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
        ->postJson(route('api.admin.categories.store'), [
            'name' => 'Summer Shirts',
            'slug' => '',
            'description' => 'Warm weather shirting.',
            'is_visible' => true,
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Summer Shirts');

    $category = ProductCategory::query()->where('slug', 'summer-shirts')->firstOrFail();

    expect($category->name)->toBe('Summer Shirts')
        ->and($category->is_visible)->toBeTrue();

    $this->actingAs($admin)
        ->putJson(route('api.admin.categories.update', $category), [
            'name' => 'Resort Shirts',
            'slug' => 'resort-shirts',
            'description' => null,
            'is_visible' => false,
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.slug', 'resort-shirts');

    $category->refresh();

    expect($category->name)->toBe('Resort Shirts')
        ->and($category->slug)->toBe('resort-shirts')
        ->and($category->is_visible)->toBeFalse();

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.categories.destroy', $category))
        ->assertSuccessful();

    $this->assertModelMissing($category);
});

test('admins can create update and delete storefront banners', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('api.admin.banners.store'), [
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
        ], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Quiet luxury essentials');

    $banner = StorefrontBanner::query()->where('title', 'Quiet luxury essentials')->firstOrFail();

    expect($banner->position)->toBe('hero')
        ->and($banner->is_active)->toBeTrue()
        ->and($banner->sort_order)->toBe(15)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->post(route('api.admin.banners.update', $banner), [
            '_method' => 'put',
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
        ], ['Accept' => 'application/json'])
        ->assertSuccessful()
        ->assertJsonPath('data.title', 'Elevated Essentials');

    $banner->refresh();

    expect($banner->position)->toBe('bottom')
        ->and($banner->title)->toBe('Elevated Essentials')
        ->and($banner->is_active)->toBeFalse()
        ->and($banner->sort_order)->toBe(20)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.banners.destroy', $banner))
        ->assertSuccessful();

    $this->assertModelMissing($banner);
});

test('admins cannot store unsafe banner urls', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('api.admin.banners.store'), [
            'position' => 'hero',
            'eyebrow' => 'New season',
            'title' => 'Quiet luxury essentials',
            'subtitle' => 'Refined pieces for every day.',
            'body' => null,
            'primary_action_label' => 'Shop Now',
            'primary_action_url' => 'javascript:alert(1)',
            'secondary_action_label' => 'Explore',
            'secondary_action_url' => 'data:text/html,<script>alert(1)</script>',
            'image_url' => 'javascript:alert(1)',
            'is_active' => true,
            'sort_order' => 15,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'primary_action_url',
            'secondary_action_url',
            'image_url',
        ]);
});

test('admins can create update and delete products without order history', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();
    $category = ProductCategory::factory()->create();

    $this->actingAs($admin)
        ->post(route('api.admin.products.store'), [
            'product_category_id' => $category->id,
            'name' => 'Cotton Overshirt',
            'slug' => '',
            'sku' => 'DRN-100',
            'description' => 'Structured overshirt.',
            'price' => '129.00',
            'currency' => 'usd',
            'image_uploads' => [
                UploadedFile::fake()->image('overshirt-front.jpg', 900, 1100),
                UploadedFile::fake()->image('overshirt-back.jpg', 900, 1100),
                UploadedFile::fake()->image('overshirt-detail.jpg', 900, 1100),
                UploadedFile::fake()->image('overshirt-fit.jpg', 900, 1100),
            ],
            'color_image_uploads' => [
                colorUploadSet('olive-overshirt'),
                colorUploadSet('sand-overshirt'),
            ],
            'is_active' => true,
            'is_featured' => false,
            'variants' => [
                ...variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0),
                ...variantsPayload('Sand', '#d8c9aa', [1, 2, 3, 4, 5], 1),
            ],
        ], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Cotton Overshirt');

    $product = Product::query()->where('slug', 'cotton-overshirt')->firstOrFail();

    $oliveMediumVariant = $product->variants()->where('color_name', 'Olive')->where('size', 'M')->firstOrFail();

    expect($product->sku)->toBe('DRN-100')
        ->and($product->currency)->toBe('USD')
        ->and($product->price_cents)->toBe(12900)
        ->and($product->category?->is($category))->toBeTrue()
        ->and($product->primary_image_url)->toContain('/storage/products/')
        ->and($product->gallery_image_urls)->toHaveCount(3)
        ->and($product->variants()->count())->toBe(10)
        ->and($oliveMediumVariant->stock_quantity)->toBe(4)
        ->and($oliveMediumVariant->image_url)->toContain('/storage/product-variants/')
        ->and($oliveMediumVariant->images()->count())->toBe(4)
        ->and($product->variants()->where('color_name', 'Sand')->where('size', 'XL')->first()?->stock_quantity)->toBe(4);

    Storage::disk('public')->assertExists(Str::after($product->primary_image_url, '/storage/'));
    Storage::disk('public')->assertExists(Str::after($product->gallery_image_urls[0], '/storage/'));
    Storage::disk('public')->assertExists(Str::after(
        $oliveMediumVariant->images()->orderBy('sort_order')->firstOrFail()->image_url,
        '/storage/',
    ));

    $this->actingAs($admin)
        ->post(route('api.admin.products.update', $product), [
            '_method' => 'put',
            'product_category_id' => null,
            'name' => 'Cotton Work Shirt',
            'slug' => 'cotton-work-shirt',
            'sku' => 'DRN-101',
            'description' => null,
            'price' => '99.00',
            'currency' => 'USD',
            'image_uploads' => [
                UploadedFile::fake()->image('work-shirt-front.webp', 900, 1100),
                UploadedFile::fake()->image('work-shirt-detail.webp', 900, 1100),
            ],
            'color_image_uploads' => [
                colorUploadSet('navy-work-shirt'),
                colorUploadSet('ecru-work-shirt'),
            ],
            'is_active' => false,
            'is_featured' => true,
            'variants' => [
                ...variantsPayload('Navy', '#101828', [8, 9, 10, 6, 4], 0),
                ...variantsPayload('Ecru', '#ece6d8', [2, 3, 4, 3, 2], 1),
            ],
        ], ['Accept' => 'application/json'])
        ->assertSuccessful()
        ->assertJsonPath('data.name', 'Cotton Work Shirt');

    $product->refresh();

    $navyLargeVariant = $product->variants()->where('color_name', 'Navy')->where('size', 'L')->firstOrFail();

    expect($product->name)->toBe('Cotton Work Shirt')
        ->and($product->product_category_id)->toBeNull()
        ->and($product->price_cents)->toBe(9900)
        ->and($product->is_featured)->toBeTrue()
        ->and($product->primary_image_url)->toContain('/storage/products/')
        ->and($product->gallery_image_urls)->toHaveCount(1)
        ->and($product->variants()->count())->toBe(10)
        ->and($product->variants()->where('color_name', 'Olive')->exists())->toBeFalse()
        ->and($navyLargeVariant->stock_quantity)->toBe(10)
        ->and($navyLargeVariant->image_url)->toContain('/storage/product-variants/')
        ->and($navyLargeVariant->images()->count())->toBe(4)
        ->and($product->variants()->where('color_name', 'Ecru')->where('size', 'L')->first()?->stock_quantity)->toBe(4);

    Storage::disk('public')->assertExists(Str::after($product->primary_image_url, '/storage/'));

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.products.destroy', $product))
        ->assertSuccessful();

    $this->assertModelMissing($product);
});

test('admins must upload or retain at least four images per product color', function () {
    Storage::fake('public');

    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('api.admin.products.store'), productPayload([
            'color_image_uploads' => [
                [
                    UploadedFile::fake()->image('olive-1.jpg', 900, 1100),
                    UploadedFile::fake()->image('olive-2.jpg', 900, 1100),
                    UploadedFile::fake()->image('olive-3.jpg', 900, 1100),
                ],
            ],
            'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0, []),
        ]), ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('color_image_uploads.0');
});

test('admins cannot store unsafe product image urls', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('api.admin.products.store'), productPayload([
            'primary_image_url' => 'javascript:alert(1)',
            'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0),
        ]))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('primary_image_url');
});

test('admins can store safe uploaded image paths on products', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('api.admin.products.store'), productPayload([
            'existing_image_urls' => ['/storage/products/overshirt-front.jpg'],
            'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0),
        ]))
        ->assertCreated();

    expect(Product::query()->where('slug', 'cotton-overshirt')->first()?->primary_image_url)
        ->toBe('/storage/products/overshirt-front.jpg');
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
        ->deleteJson(route('api.admin.products.destroy', $product))
        ->assertUnprocessable()
        ->assertJsonValidationErrors('product');

    $this->assertModelExists($product);
});

test('admins can update and delete orders', function () {
    $admin = User::factory()->admin()->create();
    $order = Order::factory()->create();
    $item = OrderItem::factory()->create([
        'order_id' => $order->id,
    ]);

    $this->actingAs($admin)
        ->putJson(route('api.admin.orders.update', $order), [
            'status' => OrderStatus::Shipped->value,
            'payment_status' => PaymentStatus::Paid->value,
        ])
        ->assertSuccessful()
        ->assertJsonPath('data.status', OrderStatus::Shipped->value);

    $order->refresh();

    expect($order->status)->toBe(OrderStatus::Shipped)
        ->and($order->payment_status)->toBe(PaymentStatus::Paid);

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.orders.destroy', $order))
        ->assertSuccessful();

    $this->assertModelMissing($order);
    $this->assertModelMissing($item);
});

/**
 * @param  array<int, int>  $quantities
 * @param  array<int, string>|null  $imageUrls
 * @return array<int, array{size: string, color_name: string, color_hex: string, image_urls: array<int, string>, color_image_upload_index: int, stock_quantity: int}>
 */
function variantsPayload(string $colorName, string $colorHex, array $quantities, int $colorImageUploadIndex, ?array $imageUrls = null): array
{
    $imageUrls ??= colorImageUrls($colorName);

    return collect(['S', 'M', 'L', 'XL', 'XXL'])
        ->map(fn (string $size, int $index): array => [
            'size' => $size,
            'color_name' => $colorName,
            'color_hex' => $colorHex,
            'image_urls' => $imageUrls,
            'color_image_upload_index' => $colorImageUploadIndex,
            'stock_quantity' => $quantities[$index],
        ])
        ->all();
}

/**
 * @return array<int, UploadedFile>
 */
function colorUploadSet(string $name): array
{
    return collect(range(1, 4))
        ->map(fn (int $index): UploadedFile => UploadedFile::fake()->image("{$name}-{$index}.jpg", 900, 1100))
        ->all();
}

/**
 * @return array<int, string>
 */
function colorImageUrls(string $colorName): array
{
    $slug = Str::slug($colorName);

    return collect(range(1, 4))
        ->map(fn (int $index): string => "/storage/product-variants/{$slug}-{$index}.jpg")
        ->all();
}

/**
 * @param  array<string, mixed>  $overrides
 * @return array<string, mixed>
 */
function productPayload(array $overrides = []): array
{
    return array_replace([
        'product_category_id' => null,
        'name' => 'Cotton Overshirt',
        'slug' => '',
        'sku' => 'DRN-100',
        'description' => 'Structured overshirt.',
        'price' => '129.00',
        'currency' => 'usd',
        'is_active' => true,
        'is_featured' => false,
        'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0),
    ], $overrides);
}
