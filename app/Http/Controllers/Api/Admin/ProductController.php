<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Images\StoreOptimizedImage;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    private const array Sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    public function __construct(private StoreOptimizedImage $storeOptimizedImage) {}

    public function index(Request $request): JsonResponse
    {
        $search = Str::limit($request->string('search')->trim()->value(), 100, '');

        $products = Product::query()
            ->select([
                'id',
                'product_category_id',
                'name',
                'slug',
                'sku',
                'price_cents',
                'currency',
                'is_active',
                'is_featured',
                'primary_image_url',
                'updated_at',
            ])
            ->with([
                'category:id,name',
                'variants:id,product_id,color_name,color_hex',
            ])
            ->withCount('variants')
            ->withSum('variants as stock_quantity', 'stock_quantity')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('name', 'like', "%{$search}%")
                        ->orWhere('slug', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%")
                        ->orWhereHas('category', fn ($query) => $query->where('name', 'like', "%{$search}%"))
                        ->orWhereHas('variants', fn ($query) => $query->where('color_name', 'like', "%{$search}%"));
                });
            })
            ->latest('updated_at')
            ->latest('id')
            ->paginate(15)
            ->withQueryString()
            ->through(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'slug' => $product->slug,
                'sku' => $product->sku,
                'price_cents' => $product->price_cents,
                'currency' => $product->currency,
                'is_active' => $product->is_active,
                'is_featured' => $product->is_featured,
                'primary_image_url' => $product->primary_image_url,
                'updated_at' => $product->updated_at,
                'variants_count' => $product->variants_count,
                'stock_quantity' => (int) $product->stock_quantity,
                'category' => $product->category,
                'colors' => $product->variants
                    ->unique(fn (ProductVariant $variant): string => $variant->color_name.'|'.$variant->color_hex)
                    ->map(fn (ProductVariant $variant): array => [
                        'name' => $variant->color_name,
                        'hex' => $variant->color_hex,
                    ])
                    ->values(),
            ]);

        $categories = ProductCategory::query()
            ->select(['id', 'name'])
            ->where('is_visible', true)
            ->orderBy('name')
            ->get();

        return response()->json([
            'data' => [
                'products' => $products,
                'categories' => $categories,
                'sizeOptions' => self::Sizes,
            ],
        ]);
    }

    public function show(Product $product): JsonResponse
    {
        return response()->json([
            'data' => $product->load([
                'category:id,name',
                'variants:id,product_id,size,color_name,color_hex,image_url,stock_quantity,is_active,sort_order',
                'variants.images:id,product_variant_id,image_url,sort_order',
            ]),
        ]);
    }

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $this->productAttributes($request);

        $product = DB::transaction(function () use ($validated): Product {
            $product = Product::create(Arr::except($validated, ['variants', 'color_image_uploads']));
            $this->syncVariants($product, $validated['variants'], $validated['color_image_uploads'] ?? []);

            return $product;
        });

        return response()->json([
            'data' => $product->load(['category:id,name', 'variants.images']),
            'message' => 'Product created.',
        ], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $validated = $this->productAttributes($request, $product);

        DB::transaction(function () use ($product, $validated): void {
            $product->update(Arr::except($validated, ['variants', 'color_image_uploads']));
            $this->syncVariants($product, $validated['variants'], $validated['color_image_uploads'] ?? []);
        });

        return response()->json([
            'data' => $product->fresh()->load(['category:id,name', 'variants.images']),
            'message' => 'Product updated.',
        ]);
    }

    public function destroy(Product $product): JsonResponse
    {
        if ($product->orderItems()->exists()) {
            return response()->json([
                'message' => 'Products with order history cannot be deleted.',
                'errors' => [
                    'product' => ['Products with order history cannot be deleted.'],
                ],
            ], 422);
        }

        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /**
     * @param  array<int, array{size: string, color_name: string, color_hex: string|null, image_url: string|null, image_urls: array<int, string>, color_image_upload_index: int|null, stock_quantity: int}>  $variants
     * @param  array<int, array<int, UploadedFile>|UploadedFile|null>  $colorImageUploads
     */
    private function syncVariants(Product $product, array $variants, array $colorImageUploads): void
    {
        $existingVariants = $product->variants()
            ->with('images')
            ->orderBy('sort_order')
            ->get()
            ->keyBy(fn ($variant): string => $this->variantKey($variant->size, $variant->color_name));
        $syncedVariantIds = [];
        $colorImageGalleries = [];

        foreach (array_values($variants) as $sortOrder => $variantData) {
            $variantKey = $this->variantKey($variantData['size'], $variantData['color_name']);
            $colorKey = Str::lower(Str::squish($variantData['color_name']));
            $variant = $existingVariants->get(
                $variantKey,
            );

            if (! array_key_exists($colorKey, $colorImageGalleries)) {
                $colorImageGalleries[$colorKey] = $this->storedVariantImageUrls($variantData, $colorImageUploads);
            }

            $attributes = [
                'sku' => $this->variantSku($product, $variantData['color_name'], $variantData['size']),
                'size' => $variantData['size'],
                'color_name' => $variantData['color_name'],
                'color_hex' => $variantData['color_hex'],
                'image_url' => $colorImageGalleries[$colorKey][0] ?? null,
                'stock_quantity' => $variantData['stock_quantity'],
                'reserved_quantity' => $variant?->reserved_quantity ?? 0,
                'is_active' => true,
                'sort_order' => $sortOrder,
            ];

            if ($variant) {
                $variant->update($attributes);
                $this->syncVariantImages($variant, $colorImageGalleries[$colorKey]);
                $syncedVariantIds[] = $variant->id;

                continue;
            }

            $variant = $product->variants()->create($attributes);
            $this->syncVariantImages($variant, $colorImageGalleries[$colorKey]);
            $syncedVariantIds[] = $variant->id;
        }

        $product->variants()->whereNotIn('id', $syncedVariantIds)->delete();
    }

    private function variantKey(string $size, string $colorName): string
    {
        return Str::lower(Str::squish($colorName)).'|'.Str::upper($size);
    }

    private function variantSku(Product $product, string $colorName, string $size): string
    {
        $baseSku = $product->sku ?: Str::upper($product->slug);
        $normalizedColorName = Str::lower(Str::squish($colorName));
        $colorSku = Str::upper(Str::slug($normalizedColorName)) ?: 'COLOR';
        $colorKey = Str::limit(hash('sha256', $normalizedColorName), 8, '');

        return Str::limit(Str::upper($baseSku), 170, '')
            .'-'.Str::limit($colorSku, 40, '')
            .'-'.$colorKey
            .'-'.$size;
    }

    /**
     * @return array<string, mixed>
     */
    private function productAttributes(StoreProductRequest|UpdateProductRequest $request, ?Product $product = null): array
    {
        $attributes = $request->validated();
        $prospectiveProduct = new Product(Arr::only($attributes, ['sku', 'slug']));
        $variantSkus = collect($attributes['variants'])
            ->map(fn (array $variant): string => $this->variantSku($prospectiveProduct, $variant['color_name'], $variant['size']));
        $conflictingVariant = ProductVariant::query()
            ->whereIn('sku', $variantSkus)
            ->when($product !== null, fn ($query) => $query->where('product_id', '!=', $product->id))
            ->first(['id', 'sku']);

        if ($conflictingVariant !== null) {
            throw ValidationException::withMessages([
                'variants' => "Variant SKU {$conflictingVariant->sku} already exists in inventory. Resolve its product link before saving; existing stock has not been changed.",
            ]);
        }

        if ($request->hasFile('image_uploads')) {
            $uploadedImageUrls = collect($request->file('image_uploads'))
                ->take(4)
                ->map(fn (UploadedFile $image): string => $this->storeOptimizedImage->handle($image, 'products'))
                ->values();

            $attributes['primary_image_url'] = $uploadedImageUrls->first();
            $attributes['gallery_image_urls'] = $uploadedImageUrls->skip(1)->values()->all();
        } elseif (array_key_exists('existing_image_urls', $attributes)) {
            $existingImageUrls = collect($attributes['existing_image_urls'])
                ->filter()
                ->take(4)
                ->values();

            $attributes['primary_image_url'] = $existingImageUrls->first();
            $attributes['gallery_image_urls'] = $existingImageUrls->skip(1)->values()->all();
        }

        if ($request->hasFile('primary_image_upload')) {
            $attributes['primary_image_url'] = $this->storeOptimizedImage->handle(
                $request->file('primary_image_upload'),
                'products',
            );
        }

        unset($attributes['existing_image_urls'], $attributes['image_uploads']);
        unset($attributes['primary_image_upload']);

        return $attributes;
    }

    /**
     * @param  array<int, string>  $imageUrls
     */
    private function syncVariantImages(ProductVariant $variant, array $imageUrls): void
    {
        $variant->images()->delete();
        $variant->images()->createMany(
            collect($imageUrls)
                ->take(4)
                ->values()
                ->map(fn (string $imageUrl, int $index): array => [
                    'image_url' => $imageUrl,
                    'sort_order' => $index,
                ])
                ->all(),
        );
    }

    /**
     * @param  array{image_url: string|null, image_urls: array<int, string>, color_image_upload_index: int|null}  $variantData
     * @param  array<int, array<int, UploadedFile>|UploadedFile|null>  $colorImageUploads
     * @return array<int, string>
     */
    private function storedVariantImageUrls(array $variantData, array $colorImageUploads): array
    {
        $uploadIndex = $variantData['color_image_upload_index'];
        $imageUploads = is_int($uploadIndex) ? Arr::wrap($colorImageUploads[$uploadIndex] ?? []) : [];
        $storedImageUrls = collect($imageUploads)
            ->filter(fn (mixed $imageUpload): bool => $imageUpload instanceof UploadedFile)
            ->take(4)
            ->map(fn (UploadedFile $imageUpload): string => $this->storeOptimizedImage->handle(
                $imageUpload,
                'product-variants',
            ))
            ->values()
            ->all();

        if ($storedImageUrls !== []) {
            return $storedImageUrls;
        }

        return collect($variantData['image_urls'] ?? [$variantData['image_url']])
            ->filter()
            ->take(4)
            ->values()
            ->all();
    }
}
