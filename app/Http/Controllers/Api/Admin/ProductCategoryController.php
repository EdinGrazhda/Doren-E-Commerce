<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductCategoryRequest;
use App\Http\Requests\Admin\UpdateProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\JsonResponse;

class ProductCategoryController extends Controller
{
    public function index(): JsonResponse
    {
        $categories = ProductCategory::query()
            ->select(['id', 'name', 'slug', 'description', 'is_visible', 'updated_at'])
            ->withCount([
                'products',
                'products as active_products_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('name')
            ->get();

        return response()->json(['data' => ['categories' => $categories]]);
    }

    public function store(StoreProductCategoryRequest $request): JsonResponse
    {
        $productCategory = ProductCategory::create($request->validated());

        return response()->json([
            'data' => $productCategory,
            'message' => 'Category created.',
        ], 201);
    }

    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): JsonResponse
    {
        $productCategory->update($request->validated());

        return response()->json([
            'data' => $productCategory->fresh(),
            'message' => 'Category updated.',
        ]);
    }

    public function destroy(ProductCategory $productCategory): JsonResponse
    {
        $productCategory->delete();

        return response()->json(['message' => 'Category deleted.']);
    }
}
