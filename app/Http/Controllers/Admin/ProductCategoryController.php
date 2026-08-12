<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductCategoryRequest;
use App\Http\Requests\Admin\UpdateProductCategoryRequest;
use App\Models\ProductCategory;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class ProductCategoryController extends Controller
{
    public function index(): Response
    {
        $categories = ProductCategory::query()
            ->select(['id', 'name', 'slug', 'description', 'is_visible', 'updated_at'])
            ->withCount([
                'products',
                'products as active_products_count' => fn ($query) => $query->where('is_active', true),
            ])
            ->orderBy('name')
            ->get();

        return Inertia::render('admin/categories/index', [
            'categories' => $categories,
        ]);
    }

    public function store(StoreProductCategoryRequest $request): RedirectResponse
    {
        ProductCategory::create($request->validated());

        return to_route('dashboard.categories.index');
    }

    public function update(UpdateProductCategoryRequest $request, ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->update($request->validated());

        return to_route('dashboard.categories.index');
    }

    public function destroy(ProductCategory $productCategory): RedirectResponse
    {
        $productCategory->delete();

        return to_route('dashboard.categories.index');
    }
}
