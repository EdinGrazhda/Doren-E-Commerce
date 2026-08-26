<?php

use App\Http\Controllers\Api\Admin\CustomerController;
use App\Http\Controllers\Api\Admin\DashboardController;
use App\Http\Controllers\Api\Admin\InventoryController;
use App\Http\Controllers\Api\Admin\OrderController;
use App\Http\Controllers\Api\Admin\ProductCategoryController;
use App\Http\Controllers\Api\Admin\ProductController;
use App\Http\Controllers\Api\Admin\StorefrontBannerController;
use App\Http\Controllers\Api\Admin\StoreSettingController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::get('/user', function (Request $request) {
    return response()->json([
        'data' => $request->user()?->only(['id', 'name', 'email', 'is_admin']),
    ]);
})->middleware('auth:sanctum');

Route::middleware(['auth:sanctum', 'verified', 'admin', 'throttle:api'])
    ->prefix('admin')
    ->name('api.admin.')
    ->group(function (): void {
        Route::get('/dashboard', DashboardController::class)->name('dashboard');
        Route::apiResource('orders', OrderController::class)->only(['index', 'update', 'destroy']);
        Route::apiResource('products', ProductController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::apiResource('inventory', InventoryController::class)->only(['index', 'store']);
        Route::apiResource('categories', ProductCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->parameters(['categories' => 'productCategory']);
        Route::apiResource('banners', StorefrontBannerController::class)->only(['index', 'store', 'update', 'destroy']);
        Route::get('/customers', CustomerController::class)->name('customers.index');
        Route::get('/settings', StoreSettingController::class)->name('settings.index');
    });
