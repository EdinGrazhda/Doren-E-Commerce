<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Product;
use App\Models\ProductCategory;
use App\OrderStatus;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $recentOrders = Order::query()
            ->select([
                'id',
                'order_number',
                'status',
                'payment_status',
                'customer_first_name',
                'customer_last_name',
                'customer_email',
                'total_cents',
                'currency',
                'created_at',
            ])
            ->withCount('items')
            ->latest()
            ->limit(6)
            ->get();

        $lowStockProducts = Product::query()
            ->select(['id', 'product_category_id', 'name', 'slug', 'price_cents', 'currency'])
            ->with(['category:id,name'])
            ->withCount([
                'variants',
                'variants as low_stock_variants_count' => fn ($query) => $query
                    ->where('is_active', true)
                    ->where('stock_quantity', '<=', 5),
            ])
            ->where('is_active', true)
            ->whereHas('variants', fn ($query) => $query
                ->where('is_active', true)
                ->where('stock_quantity', '<=', 5))
            ->orderByDesc('low_stock_variants_count')
            ->limit(5)
            ->get();

        return response()->json([
            'data' => [
                'metrics' => [
                    'orders_count' => Order::count(),
                    'pending_orders_count' => Order::where('status', OrderStatus::Pending->value)->count(),
                    'products_count' => Product::where('is_active', true)->count(),
                    'categories_count' => ProductCategory::where('is_visible', true)->count(),
                    'revenue_cents' => Order::sum('total_cents'),
                ],
                'recentOrders' => $recentOrders,
                'lowStockProducts' => $lowStockProducts,
            ],
        ]);
    }
}
