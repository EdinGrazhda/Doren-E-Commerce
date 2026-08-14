<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;
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
                'description',
                'updated_at',
            ])
            ->with([
                'category:id,name',
                'variants:id,product_id,size,color_name,color_hex,stock_quantity,is_active',
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
            $product = Product::create(Arr::except($validated, 'variants'));
            $this->syncVariants($product, $validated['variants']);

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
            $product->update(Arr::except($validated, 'variants'));
            $this->syncVariants($product, $validated['variants']);
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
     * @param  array<int, array{size: string, color_name: string, color_hex: string|null, stock_quantity: int}>  $variants
     */
    private function syncVariants(Product $product, array $variants): void
    {
        $existingVariants = $product->variants()
            ->orderBy('sort_order')
            ->get()
            ->groupBy('size');

        foreach (array_values($variants) as $sortOrder => $variantData) {
            $variant = $existingVariants->get($variantData['size'])?->first();
            $attributes = [
                'sku' => $this->variantSku($product, $variantData['size']),
                'size' => $variantData['size'],
                'color_name' => $variantData['color_name'],
                'color_hex' => $variantData['color_hex'],
                'stock_quantity' => $variantData['stock_quantity'],
                'reserved_quantity' => $variant?->reserved_quantity ?? 0,
                'is_active' => true,
                'sort_order' => $sortOrder,
            ];

            if ($variant) {
                $variant->update($attributes);

                continue;
            }

            $product->variants()->create($attributes);
        }
    }

    private function variantSku(Product $product, string $size): string
    {
        $baseSku = $product->sku ?: Str::upper($product->slug);

        return Str::limit(Str::upper($baseSku), 250, '').'-'.$size;
    }

    /**
     * @return array<string, mixed>
     */
    private function productAttributes(StoreProductRequest|UpdateProductRequest $request): array
    {
        $attributes = $request->validated();

        if ($request->hasFile('primary_image_upload')) {
            $path = $request->file('primary_image_upload')->store('products', 'public');
            $attributes['primary_image_url'] = Storage::disk('public')->url($path);
        }

        unset($attributes['primary_image_upload']);

        return $attributes;
    }
}
