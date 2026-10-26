<?php

use App\Jobs\RunSeoAudit;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\SeoAuditRun;
use App\Models\User;
use App\Services\AuditSeoCatalog;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;

beforeEach(function () {
    config([
        'seo.canonical_url' => 'https://shop.example.com',
        'seo.audit.product_limit' => 1000,
        'seo.audit.history_limit' => 20,
        'seo.audit.enabled' => false,
        'inertia.ssr.enabled' => true,
    ]);
});

test('SEO administration rejects guests customers unverified admins and unauthorized employees', function () {
    $this->get(route('dashboard.seo.index'))->assertRedirect(route('login'));
    $this->getJson(route('api.admin.seo.index'))->assertUnauthorized();
    $this->postJson(route('api.admin.seo.store'))->assertUnauthorized();

    foreach ([User::factory()->create(), User::factory()->admin()->unverified()->create(), User::factory()->employee()->create()] as $user) {
        $this->actingAs($user)->getJson(route('api.admin.seo.index'))->assertForbidden();
        $this->actingAs($user)->postJson(route('api.admin.seo.store'))->assertForbidden();
    }

    expect(SeoAuditRun::count())->toBe(0);
});

test('admins can load the SEO page and queue an audit without accepting caller supplied findings', function () {
    Queue::fake();
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get(route('dashboard.seo.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page->component('admin/seo/index'));

    $this->postJson(route('api.admin.seo.store'), ['status' => 'completed', 'findings' => [['secret' => 'untrusted']]])
        ->assertAccepted()
        ->assertJsonPath('data.run.status', 'queued')
        ->assertJsonPath('data.run.source', 'admin')
        ->assertJsonPath('data.run.findings', [])
        ->assertJsonMissingPath('data.run.triggered_by');

    $run = SeoAuditRun::sole();
    expect($run->triggered_by)->toBe($admin->id);
    Queue::assertPushed(RunSeoAudit::class, fn (RunSeoAudit $job): bool => $job->auditRunId === $run->id);
});

test('employees with read permission can view bounded history but cannot start audits', function () {
    config(['seo.audit.history_limit' => 2]);
    $employee = User::factory()->employee()->create();
    $employee->givePermissionTo(Permission::findOrCreate('seo.read'));
    SeoAuditRun::factory()->count(3)->create();

    $this->actingAs($employee)->getJson(route('api.admin.seo.index'))
        ->assertOk()
        ->assertJsonCount(2, 'data.runs')
        ->assertJsonPath('data.runs.0.id', SeoAuditRun::latest('id')->first()->id)
        ->assertJsonPath('data.external_data_available', false)
        ->assertJsonPath('data.automation_enabled', false);
    $this->postJson(route('api.admin.seo.store'))->assertForbidden();
});

test('audits persist actionable catalog findings without fetching URLs or modifying catalog content', function () {
    Http::preventStrayRequests();
    $category = ProductCategory::factory()->create(['description' => '<p> </p>', 'is_visible' => true]);
    $product = Product::factory()->create([
        'product_category_id' => $category->id,
        'name' => 'Cotton Shirt',
        'description' => null,
        'primary_image_url' => null,
    ]);
    Product::factory()->create(['name' => 'Cotton Shirt', 'description' => 'A useful product description.', 'product_category_id' => null]);
    Product::factory()->create(['is_active' => false, 'description' => null, 'primary_image_url' => null]);
    $run = SeoAuditRun::factory()->create();

    (new RunSeoAudit($run->id))->handle(app(AuditSeoCatalog::class));

    $run->refresh();
    $codes = array_column($run->findings, 'code');
    expect($run->status)->toBe('completed')
        ->and($run->started_at)->not->toBeNull()
        ->and($run->completed_at)->not->toBeNull()
        ->and($run->summary['products_checked'])->toBe(2)
        ->and($run->summary['categories_checked'])->toBe(1)
        ->and($run->checked_pages_count)->toBe(4)
        ->and($codes)->toContain('product_description_missing', 'product_image_missing', 'product_name_duplicate', 'product_category_missing', 'collection_description_missing')
        ->and($product->fresh()->description)->toBeNull()
        ->and($product->fresh()->primary_image_url)->toBeNull();
    Http::assertNothingSent();
});

test('audits report duplicate descriptions and missing rendering configuration without leaking credentials', function () {
    config(['seo.canonical_url' => 'https://private:secret@example.com', 'inertia.ssr.enabled' => false]);
    Product::factory()->count(2)->create(['description' => 'An identical description.']);

    $report = app(AuditSeoCatalog::class)->run();

    expect(array_column($report['findings'], 'code'))->toContain('product_description_duplicate', 'canonical_origin_invalid', 'ssr_disabled')
        ->and(json_encode($report))->not->toContain('secret', 'private:');
});

test('audit sampling and stored findings are bounded and explicitly marked', function () {
    config(['seo.audit.product_limit' => 1]);
    Product::factory()->count(2)->create();
    $report = app(AuditSeoCatalog::class)->run();

    expect($report['summary']['products_checked'])->toBe(1)
        ->and($report['summary']['catalog_truncated'])->toBeTrue();

    config(['seo.audit.product_limit' => 1000]);
    Product::factory()->count(105)->create(['description' => null, 'primary_image_url' => null, 'product_category_id' => null]);
    $report = app(AuditSeoCatalog::class)->run();

    expect($report['findings'])->toHaveCount(200)
        ->and($report['issues_count'])->toBeGreaterThan(200)
        ->and($report['summary']['findings_truncated'])->toBeTrue();
});

test('completed audit jobs are idempotent and failure messages are sanitized', function () {
    $run = SeoAuditRun::factory()->create();
    $job = new RunSeoAudit($run->id);
    $job->handle(app(AuditSeoCatalog::class));
    $snapshot = $run->fresh()->toArray();
    Product::factory()->create(['description' => null]);
    $job->handle(app(AuditSeoCatalog::class));
    $job->failed(new RuntimeException('private-api-key'));

    expect($run->fresh()->toArray())->toBe($snapshot);

    $failed = SeoAuditRun::factory()->create();
    (new RunSeoAudit($failed->id))->failed(new RuntimeException('private-api-key'));

    expect($failed->fresh()->status)->toBe('failed')
        ->and($failed->fresh()->failure_message)->not->toContain('private-api-key');
});

test('the audit command supports synchronous execution and scheduled queue dispatch', function () {
    $this->artisan('seo:audit', ['--sync' => true])->assertSuccessful();
    expect(SeoAuditRun::sole()->status)->toBe('completed');

    Queue::fake();
    $this->artisan('seo:audit', ['--scheduled' => true])->assertSuccessful();
    expect(SeoAuditRun::latest('id')->first()->source)->toBe('scheduled');
    Queue::assertPushed(RunSeoAudit::class);
});

test('daily audit scheduling is disabled by default and has overlap protection', function () {
    $this->artisan('list')->assertSuccessful();
    $event = collect(app(Schedule::class)->events())->first(fn ($event): bool => str_contains($event->command ?? '', 'seo:audit'));

    expect($event)->not->toBeNull()
        ->and($event->expression)->toBe('0 3 * * *')
        ->and($event->withoutOverlapping)->toBeTrue()
        ->and($event->filtersPass(app()))->toBeFalse();

    config(['seo.audit.enabled' => true]);
    expect($event->filtersPass(app()))->toBeTrue();
});
