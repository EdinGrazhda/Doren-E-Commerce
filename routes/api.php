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
use App\Http\Controllers\Api\Admin\StoreSettingController;
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
        Route::get('/dashboard', DashboardController::class)->middleware('permission:dashboard.view')->name('dashboard');

        Route::apiResource('orders', OrderController::class)->only('index')->middleware('permission:orders.view');
        Route::apiResource('orders', OrderController::class)->only(['update', 'destroy'])->middleware('permission:orders.manage');
        Route::apiResource('products', ProductController::class)->only(['index', 'show'])->middleware('permission:products.view');
        Route::apiResource('products', ProductController::class)->only(['store', 'update', 'destroy'])->middleware('permission:products.manage');
        Route::apiResource('inventory', InventoryController::class)->only('index')->middleware('permission:inventory.view');
        Route::apiResource('inventory', InventoryController::class)->only('store')->middleware('permission:inventory.manage');
        Route::apiResource('categories', ProductCategoryController::class)
            ->only('index')->middleware('permission:categories.view')
            ->parameters(['categories' => 'productCategory']);
        Route::apiResource('categories', ProductCategoryController::class)
            ->only(['store', 'update', 'destroy'])->middleware('permission:categories.manage')
            ->parameters(['categories' => 'productCategory']);

        Route::apiResource('campaigns', CampaignController::class)->only('index')->middleware('permission:campaigns.view');
        Route::apiResource('campaigns', CampaignController::class)->only(['store', 'update', 'destroy'])->middleware('permission:campaigns.manage');
        Route::apiResource('banners', StorefrontBannerController::class)->only('index')->middleware('permission:banners.view');
        Route::apiResource('banners', StorefrontBannerController::class)->only(['store', 'update', 'destroy'])->middleware('permission:banners.manage');
        Route::get('/customers', CustomerController::class)->middleware('permission:customers.view')->name('customers.index');
        Route::get('/settings', StoreSettingController::class)->middleware('permission:settings.view')->name('settings.index');
        Route::apiResource('roles', RoleController::class)->except('show')->middleware('permission:roles.manage');
        Route::apiResource('permissions', PermissionController::class)->except('show')->middleware('permission:permissions.manage');
    });
