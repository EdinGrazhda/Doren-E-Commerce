<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProductController extends Controller
{
    private const array Sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    public function index(): JsonResponse
    {
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
                'gallery_image_urls',
                'description',
                'updated_at',
            ])
            ->with([
                'category:id,name',
                'variants:id,product_id,size,color_name,color_hex,image_url,stock_quantity,is_active',
            ])
            ->withCount('variants')
            ->latest('updated_at')
            ->paginate(15);

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

    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $this->productAttributes($request);

        $product = DB::transaction(function () use ($validated): Product {
            $product = Product::create(Arr::except($validated, ['variants', 'color_image_uploads']));
            $this->syncVariants($product, $validated['variants'], $validated['color_image_uploads'] ?? []);

            return $product;
        });

        return response()->json([
            'data' => $product->load(['category:id,name', 'variants']),
            'message' => 'Product created.',
        ], 201);
    }

    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $validated = $this->productAttributes($request);

        DB::transaction(function () use ($product, $validated): void {
            $product->update(Arr::except($validated, ['variants', 'color_image_uploads']));
            $this->syncVariants($product, $validated['variants'], $validated['color_image_uploads'] ?? []);
        });

        return response()->json([
            'data' => $product->fresh()->load(['category:id,name', 'variants']),
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
     * @param  array<int, array{size: string, color_name: string, color_hex: string|null, image_url: string|null, color_image_upload_index: int|null, stock_quantity: int}>  $variants
     * @param  array<int, UploadedFile|null>  $colorImageUploads
     */
    private function syncVariants(Product $product, array $variants, array $colorImageUploads): void
    {
        $existingVariants = $product->variants()
            ->orderBy('sort_order')
            ->get()
            ->keyBy(fn ($variant): string => $this->variantKey($variant->size, $variant->color_name));
        $syncedVariantIds = [];
        $colorImageUrls = [];

        foreach (array_values($variants) as $sortOrder => $variantData) {
            $variantKey = $this->variantKey($variantData['size'], $variantData['color_name']);
            $colorKey = Str::lower(Str::squish($variantData['color_name']));
            $variant = $existingVariants->get(
                $variantKey,
            );

            if (! array_key_exists($colorKey, $colorImageUrls)) {
                $colorImageUrls[$colorKey] = $this->storedVariantImageUrl($variantData, $colorImageUploads);
            }

            $attributes = [
                'sku' => $this->variantSku($product, $variantData['color_name'], $variantData['size']),
                'size' => $variantData['size'],
                'color_name' => $variantData['color_name'],
                'color_hex' => $variantData['color_hex'],
                'image_url' => $colorImageUrls[$colorKey],
                'stock_quantity' => $variantData['stock_quantity'],
                'reserved_quantity' => $variant?->reserved_quantity ?? 0,
                'is_active' => true,
                'sort_order' => $sortOrder,
            ];

            if ($variant) {
                $variant->update($attributes);
                $syncedVariantIds[] = $variant->id;

                continue;
            }

            $syncedVariantIds[] = $product->variants()->create($attributes)->id;
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
    private function productAttributes(StoreProductRequest|UpdateProductRequest $request): array
    {
        $attributes = $request->validated();

        if ($request->hasFile('image_uploads')) {
            $uploadedImageUrls = collect($request->file('image_uploads'))
                ->take(4)
                ->map(fn (UploadedFile $image): string => Storage::disk('public')->url(
                    $image->store('products', 'public'),
                ))
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
            $path = $request->file('primary_image_upload')->store('products', 'public');
            $attributes['primary_image_url'] = Storage::disk('public')->url($path);
        }

        unset($attributes['existing_image_urls'], $attributes['image_uploads']);
        unset($attributes['primary_image_upload']);

        return $attributes;
    }

    /**
     * @param  array{image_url: string|null, color_image_upload_index: int|null}  $variantData
     * @param  array<int, UploadedFile|null>  $colorImageUploads
     */
    private function storedVariantImageUrl(array $variantData, array $colorImageUploads): ?string
    {
        $uploadIndex = $variantData['color_image_upload_index'];
        $imageUpload = is_int($uploadIndex) ? ($colorImageUploads[$uploadIndex] ?? null) : null;

        if ($imageUpload instanceof UploadedFile) {
            return Storage::disk('public')->url(
                $imageUpload->store('product-variants', 'public'),
            );
        }

        return $variantData['image_url'];
    }
}
