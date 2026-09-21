<?php

use App\Http\Controllers\Api\Admin\CampaignController;
use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\InventoryController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\PermissionController;
use App\Http\Controllers\Api\Admin\ProductCategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\StorefrontBannerController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return response()->json([
        'data' => $request->user()?->only(['id', 'name', 'email', 'is_admin']),
    ]);
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'verified', 'role:admin|employee', 'throttle:api'])
    ->prefix('admin')
    ->name('api.admin.')
    ->group(function (): void {
        Route::get('/dashboard', DashboardController::class)->middleware('permission:dashboard.read')->name('dashboard');

        Route::apiResource('orders', OrderController::class)->only('index')->middleware('permission:orders.read');
        Route::apiResource('orders', OrderController::class)->only('show')->middleware('permission:orders.read');
        Route::apiResource('orders', OrderController::class)->only('update')->middleware('permission:orders.update');
        Route::apiResource('orders', OrderController::class)->only('destroy')->middleware('permission:orders.delete');
        Route::apiResource('products', ProductController::class)->only(['index', 'show'])->middleware('permission:products.read');
        Route::apiResource('products', ProductController::class)->only('store')->middleware('permission:products.create');
        Route::apiResource('products', ProductController::class)->only('update')->middleware('permission:products.update');
        Route::apiResource('products', ProductController::class)->only('destroy')->middleware('permission:products.delete');
        Route::apiResource('inventory', InventoryController::class)->only('index')->middleware('permission:inventory.read');
        Route::apiResource('inventory', InventoryController::class)->only('store')->middleware('permission:inventory.create');
        Route::apiResource('categories', ProductCategoryController::class)
            ->only('index')->middleware('permission:categories.read')
            ->parameters(['categories' => 'productCategory']);
        Route::apiResource('categories', ProductCategoryController::class)
            ->only('store')->middleware('permission:categories.create')
            ->parameters(['categories' => 'productCategory']);
        Route::apiResource('categories', ProductCategoryController::class)
            ->only('update')->middleware('permission:categories.update')
            ->parameters(['categories' => 'productCategory']);
        Route::apiResource('categories', ProductCategoryController::class)
            ->only('destroy')->middleware('permission:categories.delete')
            ->parameters(['categories' => 'productCategory']);

        Route::apiResource('campaigns', CampaignController::class)->only('index')->middleware('permission:campaigns.read');
        Route::apiResource('campaigns', CampaignController::class)->only('store')->middleware('permission:campaigns.create');
        Route::apiResource('campaigns', CampaignController::class)->only('update')->middleware('permission:campaigns.update');
        Route::apiResource('campaigns', CampaignController::class)->only('destroy')->middleware('permission:campaigns.delete');
        Route::apiResource('banners', StorefrontBannerController::class)->only('index')->middleware('permission:banners.read');
        Route::apiResource('banners', StorefrontBannerController::class)->only('store')->middleware('permission:banners.create');
        Route::apiResource('banners', StorefrontBannerController::class)->only('update')->middleware('permission:banners.update');
        Route::apiResource('banners', StorefrontBannerController::class)->only('destroy')->middleware('permission:banners.delete');
        Route::get('/customers', CustomerController::class)->middleware('permission:customers.read')->name('customers.index');
        Route::apiResource('roles', RoleController::class)->only('index')->middleware('permission:roles.read');
        Route::apiResource('roles', RoleController::class)->only('store')->middleware('permission:roles.create');
        Route::apiResource('roles', RoleController::class)->only('update')->middleware('permission:roles.update');
        Route::apiResource('roles', RoleController::class)->only('destroy')->middleware('permission:roles.delete');
        Route::apiResource('permissions', PermissionController::class)->only('index')->middleware('permission:permissions.read');
        Route::apiResource('permissions', PermissionController::class)->only('store')->middleware('permission:permissions.create');
        Route::apiResource('permissions', PermissionController::class)->only('update')->middleware('permission:permissions.update');
        Route::apiResource('permissions', PermissionController::class)->only('destroy')->middleware('permission:permissions.delete');
    });
