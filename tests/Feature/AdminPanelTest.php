<?php

use App\InventoryMovementType;
use App\Models\InventoryMovement;
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
use Illuminate\Support\Carbon;
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

test('removed admin settings endpoints are not available', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get('/dashboard/settings')
        ->assertNotFound();

    $this->actingAs($admin)
        ->getJson('/api/admin/settings')
        ->assertNotFound();
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
]);

test('admin list APIs return paginated data', function (string $routeName, string $dataKey, string $section) {
    $admin = User::factory()->admin()->create();

    match ($section) {
        'orders' => Order::factory()->count(16)->create(),
        'products' => Product::factory()->count(16)->create(),
        'categories' => ProductCategory::factory()->count(16)->create(),
        'banners' => StorefrontBanner::factory()->count(16)->create(['position' => 'hero']),
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

test('admins can search products', function () {
    $admin = User::factory()->admin()->create();
    $matchingCategory = ProductCategory::factory()->create(['name' => 'Tailored Knitwear']);

    collect(range(1, 16))->each(fn (int $index) => Product::factory()
        ->for($matchingCategory, 'category')
        ->has(ProductVariant::factory()->state(['color_name' => 'Oxblood']), 'variants')
        ->create([
            'name' => "Merino Rib Cardigan {$index}",
            'slug' => "merino-rib-cardigan-{$index}",
            'sku' => "DRN-KNIT-{$index}",
        ]));

    Product::factory()
        ->has(ProductVariant::factory()->state(['color_name' => 'Navy']), 'variants')
        ->create([
            'name' => 'Cotton Twill Trouser',
            'slug' => 'cotton-twill-trouser',
            'sku' => 'DRN-TROUSER-001',
        ]);

    $this->actingAs($admin)
        ->getJson(route('api.admin.products.index', ['search' => 'knit']))
        ->assertSuccessful()
        ->assertJsonPath('data.products.total', 16)
        ->assertJsonCount(15, 'data.products.data')
        ->assertJsonPath('data.products.next_page_url', fn (?string $url): bool => is_string($url) && str_contains($url, 'search=knit'))
        ->assertJsonMissing(['name' => 'Cotton Twill Trouser']);
});

test('admin product listings stay compact and load edit data on demand', function () {
    $admin = User::factory()->admin()->create();
    $product = Product::factory()
        ->has(ProductVariant::factory()->count(5)->state([
            'color_name' => 'Oxblood',
            'color_hex' => '#4a1018',
            'stock_quantity' => 8,
        ])->sequence(
            ['size' => 'S'],
            ['size' => 'M'],
            ['size' => 'L'],
            ['size' => 'XL'],
            ['size' => 'XXL'],
        ), 'variants')
        ->create();

    $this->actingAs($admin)
        ->getJson(route('api.admin.products.index'))
        ->assertSuccessful()
        ->assertJsonPath('data.products.data.0.id', $product->id)
        ->assertJsonPath('data.products.data.0.variants_count', 5)
        ->assertJsonPath('data.products.data.0.stock_quantity', 40)
        ->assertJsonCount(1, 'data.products.data.0.colors')
        ->assertJsonMissingPath('data.products.data.0.variants')
        ->assertJsonMissingPath('data.products.data.0.gallery_image_urls')
        ->assertJsonMissingPath('data.products.data.0.description');

    $this->actingAs($admin)
        ->getJson(route('api.admin.products.show', $product))
        ->assertSuccessful()
        ->assertJsonPath('data.id', $product->id)
        ->assertJsonCount(5, 'data.variants')
        ->assertJsonStructure(['data' => ['description', 'gallery_image_urls', 'variants']]);
});

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
        ->postJson(route('api.admin.inventory.store'), [
            'product_variant_id' => $variant->id,
            'type' => InventoryMovementType::Sold->value,
            'quantity' => 2,
            'unit_amount_cents' => 4500,
            'reference' => 'POS-1001',
        ])
        ->assertCreated();

    $this->actingAs($admin)
        ->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()
        ->assertJsonPath('data.metrics.orders_count', 1)
        ->assertJsonPath('data.metrics.products_count', 1)
        ->assertJsonPath('data.metrics.sales_count', 2)
        ->assertJsonPath('data.metrics.counter_sales_count', 1)
        ->assertJsonPath('data.metrics.revenue_cents', 18900)
        ->assertJsonPath('data.metrics.average_order_cents', 9450)
        ->assertJsonPath('data.metrics.pending_revenue_cents', 9900)
        ->assertJsonPath('data.metrics.units_sold_count', 4)
        ->assertJsonCount(1, 'data.recentOrders')
        ->assertJsonCount(1, 'data.lowStockProducts')
        ->assertJsonCount(7, 'data.salesSeries.week')
        ->assertJsonCount(6, 'data.salesSeries.month')
        ->assertJsonCount(5, 'data.salesSeries.year')
        ->assertJsonCount(7, 'data.dailySales.days')
        ->assertJsonPath('data.dailySales.today.revenue_cents', 18900)
        ->assertJsonPath('data.dailySales.today.orders_count', 2)
        ->assertJsonPath('data.dailySales.today.online_orders_count', 1)
        ->assertJsonPath('data.dailySales.today.counter_sales_count', 1)
        ->assertJsonPath('data.dailySales.today.units_sold_count', 4)
        ->assertJsonPath('data.dailySales.today.average_order_cents', 9450)
        ->assertJsonPath('data.dailySales.days.6.revenue_cents', 18900)
        ->assertJsonPath('data.dailySales.days.6.orders_count', 2)
        ->assertJsonPath('data.dailySales.days.6.online_orders_count', 1)
        ->assertJsonPath('data.dailySales.days.6.counter_sales_count', 1)
        ->assertJsonPath('data.dailySales.days.6.units_sold_count', 4)
        ->assertJsonPath('data.salesSeries.week.6.revenue_cents', 18900)
        ->assertJsonPath('data.salesSeries.week.6.orders_count', 2)
        ->assertJsonPath('data.statusBreakdown.0.status', OrderStatus::Pending->value)
        ->assertJsonPath('data.statusBreakdown.0.count', 1)
        ->assertJsonPath('data.topProducts.0.product_name', $product->name)
        ->assertJsonPath('data.topProducts.0.revenue_cents', 18900)
        ->assertJsonPath('data.topProducts.0.quantity', 4);
});

test('dashboard sales reconcile across days and exclude receipts and unsuccessful orders', function () {
    $this->travelTo(Carbon::parse('2026-09-12 12:00:00'));
    $admin = User::factory()->admin()->create();
    $today = Order::factory()->create(['total_cents' => 10000, 'created_at' => now()->startOfDay()]);
    OrderItem::factory()->for($today)->create(['quantity' => 2, 'line_total_cents' => 10000]);
    $yesterday = Order::factory()->create(['total_cents' => 4000, 'created_at' => now()->subDay()->endOfDay()]);
    OrderItem::factory()->for($yesterday)->create(['quantity' => 1, 'line_total_cents' => 4000]);

    foreach ([
        ['status' => OrderStatus::Cancelled],
        ['payment_status' => PaymentStatus::Refunded],
        ['payment_status' => PaymentStatus::Failed],
        ['created_at' => now()->addDay()],
    ] as $attributes) {
        $excluded = Order::factory()->create([...$attributes, 'total_cents' => 50000]);
        OrderItem::factory()->for($excluded)->create(['quantity' => 9, 'line_total_cents' => 50000]);
    }

    InventoryMovement::factory()->sold()->create(['quantity' => 3, 'unit_amount_cents' => 2000, 'created_at' => now()->subDay()->endOfDay()]);
    InventoryMovement::factory()->sold()->create(['quantity' => 2, 'unit_amount_cents' => 4500, 'created_at' => now()->startOfDay()]);
    InventoryMovement::factory()->create(['quantity' => 100, 'unit_amount_cents' => 8000]);
    InventoryMovement::factory()->sold()->create(['quantity' => 100, 'unit_amount_cents' => 8000, 'created_at' => now()->addDay()]);

    $data = $this->actingAs($admin)->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()
        ->assertJsonPath('data.metrics.revenue_cents', 29000)
        ->assertJsonPath('data.metrics.sales_count', 4)
        ->assertJsonPath('data.metrics.units_sold_count', 8)
        ->assertJsonPath('data.metrics.average_order_cents', 7250)
        ->assertJsonPath('data.dailySales.today.revenue_cents', 19000)
        ->assertJsonPath('data.dailySales.today.orders_count', 2)
        ->assertJsonPath('data.dailySales.today.units_sold_count', 4)
        ->assertJsonPath('data.dailySales.days.5.revenue_cents', 10000)
        ->assertJsonPath('data.dailySales.days.5.orders_count', 2)
        ->assertJsonPath('data.dailySales.days.5.units_sold_count', 4)
        ->json('data');

    foreach ($data['dailySales']['days'] as $index => $day) {
        expect($data['salesSeries']['week'][$index])
            ->toMatchArray(collect($day)->only(['date', 'label', 'revenue_cents', 'orders_count'])->all());
    }

    foreach (['week', 'month', 'year'] as $range) {
        expect(array_sum(array_column($data['salesSeries'][$range], 'revenue_cents')))->toBe(29000);
        expect(array_sum(array_column($data['salesSeries'][$range], 'orders_count')))->toBe(4);
    }
    expect(array_sum(array_column($data['topProducts'], 'revenue_cents')))->toBe(29000);
});

test('dashboard periods remain contiguous at month ends and leap days', function (string $date, string $firstMonth) {
    $this->travelTo(Carbon::parse($date));
    $admin = User::factory()->admin()->create();
    Order::factory()->create(['created_at' => Carbon::parse($firstMonth), 'total_cents' => 5000]);
    Order::factory()->create(['created_at' => Carbon::parse($firstMonth)->subSecond(), 'total_cents' => 7000]);
    Order::factory()->create(['created_at' => now()->subDays(6)->startOfDay(), 'total_cents' => 3000]);
    Order::factory()->create(['created_at' => now()->subDays(6)->startOfDay()->subSecond(), 'total_cents' => 2000]);

    $data = $this->actingAs($admin)->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()->json('data');

    expect(array_column($data['salesSeries']['month'], 'date'))->toBe(
        collect(range(0, 5))->map(fn (int $index): string => Carbon::parse($firstMonth)->addMonths($index)->toDateString())->all(),
    );
    expect(array_sum(array_column($data['salesSeries']['month'], 'revenue_cents')))->toBe(10000);
    expect(array_sum(array_column($data['salesSeries']['week'], 'revenue_cents')))->toBe(3000);
    expect($data['salesSeries']['week'][0]['revenue_cents'])->toBe(3000);
    expect(array_column($data['salesSeries']['year'], 'date'))->toBe(
        collect(range(0, 4))->map(fn (int $index): string => now()->startOfYear()->subYears(4)->addYears($index)->toDateString())->all(),
    );
})->with([
    ['2026-03-31 12:00:00', '2025-10-01'],
    ['2024-02-29 12:00:00', '2023-09-01'],
]);

test('dashboard sales return zero filled periods when there is no activity', function () {
    $admin = User::factory()->admin()->create();
    $data = $this->actingAs($admin)->getJson(route('api.admin.dashboard'))
        ->assertSuccessful()
        ->assertJsonPath('data.metrics.revenue_cents', 0)
        ->assertJsonPath('data.metrics.sales_count', 0)
        ->assertJsonPath('data.dailySales.today.average_order_cents', 0)
        ->assertJsonCount(0, 'data.topProducts')
        ->json('data');

    foreach ($data['salesSeries'] as $points) {
        expect(array_sum(array_column($points, 'revenue_cents')))->toBe(0);
        expect(array_sum(array_column($points, 'orders_count')))->toBe(0);
    }
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
            'title' => 'Quiet luxury essentials',
            'subtitle' => 'Refined pieces for every day.',
            'image_upload' => UploadedFile::fake()->image('hero.JPG', 1600, 700),
            'position' => 'bottom',
            'is_active' => false,
            'sort_order' => 500,
        ], ['Accept' => 'application/json'])
        ->assertCreated()
        ->assertJsonPath('data.title', 'Quiet luxury essentials');

    $banner = StorefrontBanner::query()->where('title', 'Quiet luxury essentials')->firstOrFail();

    expect($banner->position)->toBe('hero')
        ->and($banner->is_active)->toBeTrue()
        ->and($banner->sort_order)->toBe(10)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/')
        ->and($banner->image_url)->toEndWith('.webp');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->post(route('api.admin.banners.update', $banner), [
            '_method' => 'put',
            'title' => 'Elevated Essentials',
            'subtitle' => 'Designed for wherever life takes you.',
            'image_upload' => UploadedFile::fake()->image('bottom.webp', 1600, 700),
            'position' => 'bottom',
            'is_active' => false,
            'sort_order' => 500,
        ], ['Accept' => 'application/json'])
        ->assertSuccessful()
        ->assertJsonPath('data.title', 'Elevated Essentials');

    $banner->refresh();

    expect($banner->position)->toBe('hero')
        ->and($banner->title)->toBe('Elevated Essentials')
        ->and($banner->subtitle)->toBe('Designed for wherever life takes you.')
        ->and($banner->is_active)->toBeTrue()
        ->and($banner->sort_order)->toBe(10)
        ->and($banner->image_url)->toContain('/storage/storefront-banners/');

    Storage::disk('public')->assertExists(Str::after($banner->image_url, '/storage/'));

    $this->actingAs($admin)
        ->deleteJson(route('api.admin.banners.destroy', $banner))
        ->assertSuccessful();

    $this->assertModelMissing($banner);
});

test('admin banners only lists main hero carousel slides', function () {
    $admin = User::factory()->admin()->create();
    $heroBanner = StorefrontBanner::factory()->create([
        'position' => 'hero',
        'title' => 'Main page slide',
    ]);
    StorefrontBanner::factory()->create([
        'position' => 'top',
        'title' => 'Top announcement',
    ]);
    StorefrontBanner::factory()->create([
        'position' => 'bottom',
        'title' => 'Bottom campaign',
    ]);

    $this->actingAs($admin)
        ->getJson(route('api.admin.banners.index'))
        ->assertSuccessful()
        ->assertJsonPath('data.banners.total', 1)
        ->assertJsonPath('data.banners.data.0.id', $heroBanner->id)
        ->assertJsonMissingPath('data.positions');
});

test('admins must provide the carousel image and text', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('api.admin.banners.store'), [
            'title' => '',
            'subtitle' => '',
            'image_upload' => UploadedFile::fake()->create('hero.svg', 10, 'image/svg+xml'),
        ], ['Accept' => 'application/json'])
        ->assertUnprocessable()
        ->assertJsonValidationErrors([
            'title',
            'subtitle',
            'image_upload',
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
            'currency' => 'eur',
            'image_uploads' => [
                UploadedFile::fake()->image('overshirt-front.jpg', 2400, 1200),
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
    $primaryImagePath = Str::after($product->primary_image_url, '/storage/');
    $primaryImageInfo = getimagesize(Storage::disk('public')->path($primaryImagePath));

    expect($product->sku)->toBe('DRN-100')
        ->and($product->currency)->toBe('EUR')
        ->and($product->price_cents)->toBe(12900)
        ->and($product->category?->is($category))->toBeTrue()
        ->and($product->primary_image_url)->toContain('/storage/products/')
        ->and($product->primary_image_url)->toEndWith('.webp')
        ->and($primaryImageInfo['mime'] ?? null)->toBe('image/webp')
        ->and(max($primaryImageInfo[0] ?? 0, $primaryImageInfo[1] ?? 0))->toBe(2000)
        ->and($product->gallery_image_urls)->toHaveCount(3)
        ->and($product->gallery_image_urls[0])->toEndWith('.webp')
        ->and($product->variants()->count())->toBe(10)
        ->and($oliveMediumVariant->stock_quantity)->toBe(4)
        ->and($oliveMediumVariant->image_url)->toContain('/storage/product-variants/')
        ->and($oliveMediumVariant->image_url)->toEndWith('.webp')
        ->and($oliveMediumVariant->images()->count())->toBe(4)
        ->and($product->variants()->where('color_name', 'Sand')->where('size', 'XL')->first()?->stock_quantity)->toBe(4);

    Storage::disk('public')->assertExists($primaryImagePath);
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
            'currency' => 'EUR',
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
        'currency' => 'eur',
        'is_active' => true,
        'is_featured' => false,
        'variants' => variantsPayload('Olive', '#4b4a35', [3, 4, 5, 2, 1], 0),
    ], $overrides);
}
