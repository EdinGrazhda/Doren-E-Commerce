<?php

use App\Http\Controllers\Admin\AccessControlController;
use App\Http\Controllers\Admin\CampaignController as AdminCampaignController;
use App\Http\Controllers\Admin\CustomerController;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\InventoryController as AdminInventoryController;
use App\Http\Controllers\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Admin\ProductCategoryController as AdminProductCategoryController;
use App\Http\Controllers\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Admin\SalesController as AdminSalesController;
use App\Http\Controllers\Admin\StorefrontBannerController;
use App\Http\Controllers\Admin\StoreSettingController;
use App\Http\Controllers\CartController;
use App\Http\Controllers\CartItemController;
use App\Http\Controllers\CheckoutController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\ProductShowController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('/cart', CartController::class)->name('cart');
Route::post('/cart-items', [CartItemController::class, 'store'])->name('cart-items.store');
Route::delete('/cart-items/{variantId}', [CartItemController::class, 'destroy'])
    ->whereNumber('variantId')
    ->name('cart-items.destroy');
Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
Route::get('/checkout/thank-you/{order:order_number}', [CheckoutController::class, 'thankYou'])
    ->name('checkout.thank-you');
Route::get('/products/{product:slug}', ProductShowController::class)->name('products.show');

Route::middleware(['auth', 'verified', 'role:admin|employee'])
    ->prefix('dashboard')
    ->group(function (): void {
        Route::get('/', AdminDashboardController::class)->name('dashboard');

        Route::resource('orders', AdminOrderController::class)->only('index')->middleware('permission:orders.view')->names('dashboard.orders');
        Route::resource('products', AdminProductController::class)->only('index')->middleware('permission:products.view')->names('dashboard.products');
        Route::get('/inventory', AdminInventoryController::class)->middleware('permission:inventory.view')->name('dashboard.inventory');
        Route::resource('categories', AdminProductCategoryController::class)
            ->only('index')->middleware('permission:categories.view')->names('dashboard.categories')
            ->parameters(['categories' => 'productCategory']);

        Route::get('/campaigns', AdminCampaignController::class)->middleware('permission:campaigns.view')->name('dashboard.campaigns.index');
        Route::get('/sales', AdminSalesController::class)->middleware('permission:sales.view')->name('dashboard.sales');
        Route::get('/customers', [CustomerController::class, 'index'])->middleware('permission:customers.view')->name('dashboard.customers.index');
        Route::resource('banners', StorefrontBannerController::class)->only('index')->middleware('permission:banners.view')->names('dashboard.banners');
        Route::get('/settings', StoreSettingController::class)->middleware('permission:settings.view')->name('dashboard.settings');
        Route::get('/access-control', AccessControlController::class)->middleware('permission:roles.manage|permissions.manage')->name('dashboard.access-control');
    });

require __DIR__.'/settings.php';
