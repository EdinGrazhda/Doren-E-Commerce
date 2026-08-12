<?php

use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductCategoryController as AdminProductCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\StorefrontBannerController;
use App\Http\Controllers\Admin\StoreSettingController;
use App\Http\Controllers\HomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');

Route::middleware(['auth', 'verified', 'admin'])
    ->prefix('dashboard')
    ->group(function (): void {
        Route::get('/', AdminDashboardController::class)->name('dashboard');
        Route::resource('orders', AdminOrderController::class)
            ->only(['index', 'update', 'destroy'])
            ->names('dashboard.orders');
        Route::resource('products', AdminProductController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('dashboard.products');
        Route::resource('categories', AdminProductCategoryController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('dashboard.categories')
            ->parameters(['categories' => 'productCategory']);
        Route::resource('banners', StorefrontBannerController::class)
            ->only(['index', 'store', 'update', 'destroy'])
            ->names('dashboard.banners');
        Route::get('/customers', [CustomerController::class, 'index'])->name('dashboard.customers.index');
        Route::get('/settings', StoreSettingController::class)->name('dashboard.settings');
    });

require __DIR__.'/settings.php';
