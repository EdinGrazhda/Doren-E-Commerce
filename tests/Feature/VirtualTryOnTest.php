<?php

use App\Jobs\GenerateVirtualTryOn;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\ProductVariantImage;
use App\Models\VirtualTryOn;
use App\Services\VirtualTryOnClient;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Storage;
use Inertia\Testing\AssertableInertia as Assert;

beforeEach(function () {
    config([
        'virtual-try-on.driver' => 'service',
        'virtual-try-on.enabled' => true,
        'virtual-try-on.token' => 'test-service-token',
        'inertia.ssr.enabled' => false,
    ]);
    Storage::fake('try-ons');
    Storage::fake('public');
    Http::preventStrayRequests();
});

function tryOnVariant(string $category = 'shirts'): ProductVariant
{
    $product = Product::factory()->for(ProductCategory::factory()->state(['slug' => $category]), 'category')->create();

    return ProductVariant::factory()->for($product)->create(['image_url' => '/storage/products/blue.png', 'is_active' => true]);
}

function tryOnPhoto(): UploadedFile
{
    return UploadedFile::fake()->image('person.jpg', 600, 1000);
}

test('guest can queue a private try-on with the selected color gallery', function () {
    Queue::fake();
    $variant = tryOnVariant('trousers');
    ProductVariantImage::factory()->for($variant, 'variant')->create(['image_url' => '/storage/products/navy.png', 'sort_order' => 0]);
    $response = $this->postJson(route('products.try-ons.store', $variant->product), [
        'product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true,
    ])->assertAccepted()->assertJsonPath('data.status', 'queued')->assertJsonPath('data.image_url', null);
    $tryOn = VirtualTryOn::findOrFail($response->json('data.id'));
    expect($tryOn->category)->toBe('bottoms');
    expect($tryOn->garment_image_url)->toBe('/storage/products/navy.png');
    Storage::disk('try-ons')->assertExists($tryOn->personPath());
    expect(Storage::disk('public')->allFiles())->toBeEmpty();
    Queue::assertPushed(GenerateVirtualTryOn::class, fn ($job) => $job->tryOnId === $tryOn->id && $job->connection === 'try-ons');
    $this->getJson(route('try-ons.show', $tryOn))->assertOk()->assertJsonMissingPath('data.owner_hash');
});

test('try-on validates photos and consent before dispatch', function (string $field, mixed $value) {
    Queue::fake();
    $variant = tryOnVariant();
    $input = ['product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true];
    $input[$field] = is_callable($value) ? $value() : $value;
    $this->postJson(route('products.try-ons.store', $variant->product), $input)
        ->assertUnprocessable()->assertJsonValidationErrors($field);
    Queue::assertNothingPushed();
    expect(VirtualTryOn::count())->toBe(0);
})->with([
    'missing photo' => ['photo', null],
    'tiny photo' => ['photo', fn () => UploadedFile::fake()->image('tiny.png', 100, 100)],
    'oversized photo' => ['photo', fn () => UploadedFile::fake()->image('large.jpg', 600, 1000)->size(11000)],
    'document' => ['photo', fn () => UploadedFile::fake()->create('photo.pdf', 1, 'application/pdf')],
    'no consent' => ['consent', false],
]);

test('try-on rejects unavailable service unsupported categories and unrelated variants', function () {
    Queue::fake();
    $variant = tryOnVariant();
    $input = ['product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true];
    config(['virtual-try-on.enabled' => false]);
    $this->postJson(route('products.try-ons.store', $variant->product), $input)->assertServiceUnavailable();
    config(['virtual-try-on.enabled' => true]);
    $other = Product::factory()->create();
    $this->postJson(route('products.try-ons.store', $other), $input)->assertUnprocessable();
    $variant->product->category->update(['slug' => 'shoes']);
    $this->postJson(route('products.try-ons.store', $variant->product), $input)->assertUnprocessable();
    $variant->product->update(['is_active' => false]);
    $this->postJson(route('products.try-ons.store', $variant->product), $input)->assertForbidden();
    Queue::assertNothingPushed();
});

test('placeholder drivers cannot return the uploaded photo as an AI result', function () {
    Queue::fake();
    config(['virtual-try-on.driver' => 'local-preview']);
    $variant = tryOnVariant();

    $this->get(route('products.show', $variant->product))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('tryOn.enabled', false)->where('tryOn.requiresGarmentImage', true));

    $this->postJson(route('products.try-ons.store', $variant->product), [
        'product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true,
    ])->assertServiceUnavailable();

    Queue::assertNothingPushed();
    expect(VirtualTryOn::count())->toBe(0);
    expect(Storage::disk('try-ons')->allFiles())->toBeEmpty();
    expect(fn () => app(VirtualTryOnClient::class)->generate(VirtualTryOn::factory()->make()))
        ->toThrow(RuntimeException::class, 'A real try-on service is required');
});

test('local preview mode cannot enable generation outside local environments', function () {
    app()->detectEnvironment(fn () => 'production');
    config(['app.env' => 'production', 'virtual-try-on.driver' => 'local-preview', 'virtual-try-on.token' => null]);
    $variant = tryOnVariant();

    $this->get(route('products.show', $variant->product))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('tryOn.enabled', false)->where('tryOn.category', 'tops'));
});

test('a color without its own photo does not fall back to a different color', function () {
    Queue::fake();
    $variant = tryOnVariant();
    $variant->update(['image_url' => null]);
    $this->postJson(route('products.try-ons.store', $variant->product), [
        'product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true,
    ])->assertUnprocessable();
    Queue::assertNothingPushed();
});

test('only the owning guest session can see download or delete a preview', function () {
    $tryOn = VirtualTryOn::factory()->create(['status' => 'completed']);
    Storage::disk('try-ons')->put($tryOn->resultPath(), 'image');
    $this->withSession(['try_on_owner' => 'another-owner']);
    $this->getJson(route('try-ons.show', $tryOn))->assertNotFound();
    $this->get(route('try-ons.image', $tryOn))->assertNotFound();
    $this->deleteJson(route('try-ons.destroy', $tryOn))->assertNotFound();
    $this->withSession(['try_on_owner' => 'test-owner']);
    $this->get(route('try-ons.image', $tryOn))->assertOk()->assertHeader('Cache-Control', 'no-store, private');
    $this->deleteJson(route('try-ons.destroy', $tryOn))->assertNoContent();
    Storage::disk('try-ons')->assertMissing($tryOn->resultPath());
    $this->getJson(route('try-ons.show', $tryOn))->assertGone();
});

test('one guest cannot enqueue concurrent generations', function () {
    Queue::fake();
    $variant = tryOnVariant();
    VirtualTryOn::factory()->create();
    $this->withSession(['try_on_owner' => 'test-owner'])->postJson(route('products.try-ons.store', $variant->product), [
        'product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true,
    ])->assertConflict();
    Queue::assertNothingPushed();
});

test('generation sends authenticated multipart images and removes the original', function () {
    $tryOn = VirtualTryOn::factory()->create();
    $png = UploadedFile::fake()->image('result.png', 600, 1000)->get();
    Storage::disk('public')->put('products/garment.webp', $png);
    Storage::disk('try-ons')->put($tryOn->personPath(), $png);
    Http::fake(['*/v1/try-on' => Http::response($png, 200, ['Content-Type' => 'image/png'])]);
    $job = new GenerateVirtualTryOn($tryOn->id);
    $job->handle(new VirtualTryOnClient);
    expect($tryOn->fresh()->status)->toBe('completed');
    Storage::disk('try-ons')->assertMissing($tryOn->personPath());
    Storage::disk('try-ons')->assertExists($tryOn->resultPath());
    Http::assertSent(fn ($request) => $request->hasHeader('Authorization', 'Bearer test-service-token')
        && $request->isMultipart() && $request->hasFile('person_image') && $request->hasFile('garment_image'));
    $job->handle(new VirtualTryOnClient);
    Http::assertSentCount(1);
});

test('failed and invalid service responses never become completed previews', function (int $status, string $body) {
    $tryOn = VirtualTryOn::factory()->create();
    $png = UploadedFile::fake()->image('person.png', 600, 1000)->get();
    Storage::disk('public')->put('products/garment.webp', $png);
    Storage::disk('try-ons')->put($tryOn->personPath(), $png);
    Http::fake(['*/v1/try-on' => Http::response($body, $status)]);
    $job = new GenerateVirtualTryOn($tryOn->id);
    try {
        $job->handle(new VirtualTryOnClient);
        test()->fail('Invalid model response should fail.');
    } catch (RuntimeException $exception) {
        $job->failed($exception);
    }
    expect($tryOn->fresh()->status)->toBe('failed');
    expect(Storage::disk('try-ons')->allFiles())->toBeEmpty();
})->with([[503, 'unavailable'], [200, '<html>not an image</html>']]);

test('cancelled work cannot publish a late model result', function () {
    $tryOn = VirtualTryOn::factory()->create();
    $client = Mockery::mock(VirtualTryOnClient::class);
    $client->shouldReceive('generate')->once()->andReturnUsing(function () use ($tryOn) {
        $tryOn->update(['status' => 'cancelled']);

        return 'late result';
    });
    (new GenerateVirtualTryOn($tryOn->id))->handle($client);
    expect($tryOn->fresh()->status)->toBe('cancelled');
    expect(Storage::disk('try-ons')->allFiles())->toBeEmpty();
});

test('expired and stalled requests are cleaned without touching recent results', function () {
    $expired = VirtualTryOn::factory()->create(['expires_at' => now()->subMinute()]);
    $stalled = VirtualTryOn::factory()->create(['created_at' => now()->subMinutes(11)]);
    $recent = VirtualTryOn::factory()->create(['status' => 'completed']);
    foreach ([$expired, $stalled, $recent] as $tryOn) {
        Storage::disk('try-ons')->put($tryOn->resultPath(), 'image');
    }
    $this->withSession(['try_on_owner' => 'test-owner'])->getJson(route('try-ons.show', $expired))->assertGone();
    $this->artisan('try-ons:prune')->assertSuccessful();
    expect($expired->fresh())->toBeNull();
    expect($stalled->fresh()->status)->toBe('failed');
    Storage::disk('try-ons')->assertMissing($expired->resultPath());
    Storage::disk('try-ons')->assertMissing($stalled->resultPath());
    Storage::disk('try-ons')->assertExists($recent->resultPath());
});

test('stalled polling fails instead of spinning indefinitely', function () {
    $tryOn = VirtualTryOn::factory()->create(['created_at' => now()->subMinutes(11)]);
    $this->withSession(['try_on_owner' => 'test-owner'])->getJson(route('try-ons.show', $tryOn))
        ->assertOk()->assertJsonPath('data.status', 'failed');
});

test('catalog images cannot make arbitrary outbound requests or traverse storage', function (string $url) {
    expect(fn () => (new VirtualTryOnClient)->garment($url))->toThrow(RuntimeException::class);
    Http::assertNothingSent();
})->with(['http://127.0.0.1/private', 'https://evil.example/image.png', '/storage/../private/photo.png', '/storage/%2e%2e/private/photo.png']);

test('supported category mapping is exposed without leaking service credentials', function () {
    $variant = tryOnVariant('dresses');
    $this->get(route('products.show', $variant->product))->assertOk()->assertInertia(fn (Assert $page) => $page
        ->where('tryOn.enabled', true)->where('tryOn.category', 'one-pieces')
        ->where('tryOn.requiresGarmentImage', true)->missing('tryOn.token'));
});

test('owners can delete expired previews and repeat deletion safely', function () {
    $tryOn = VirtualTryOn::factory()->create(['expires_at' => now()->subMinute()]);
    Storage::disk('try-ons')->put($tryOn->resultPath(), 'image');
    $this->withSession(['try_on_owner' => 'test-owner']);
    $this->deleteJson(route('try-ons.destroy', $tryOn))->assertNoContent();
    $this->deleteJson(route('try-ons.destroy', $tryOn))->assertNoContent();
    expect(Storage::disk('try-ons')->allFiles())->toBeEmpty();
});

test('queue submission failures do not leave uploaded customer photos behind', function () {
    Queue::shouldReceive('connection')->andThrow(new RuntimeException('Queue unavailable'));
    $variant = tryOnVariant();
    $this->postJson(route('products.try-ons.store', $variant->product), [
        'product_variant_id' => $variant->id, 'photo' => tryOnPhoto(), 'consent' => true,
    ])->assertServerError();
    expect(VirtualTryOn::count())->toBe(0);
    expect(Storage::disk('try-ons')->allFiles())->toBeEmpty();
});

test('allowlisted remote garment images can be read but redirects cannot', function () {
    $png = UploadedFile::fake()->image('garment.png', 600, 1000)->get();
    Http::fake([
        'https://images.unsplash.com/garment.png' => Http::response($png),
        'https://images.unsplash.com/redirect' => Http::response('', 302, ['Location' => 'http://127.0.0.1/private']),
    ]);
    $client = new VirtualTryOnClient;
    expect($client->garment('https://images.unsplash.com/garment.png'))->toBe($png);
    expect(fn () => $client->garment('https://images.unsplash.com/redirect'))->toThrow(RuntimeException::class);
    Http::assertSentCount(2);
});
