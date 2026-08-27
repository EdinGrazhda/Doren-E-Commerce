<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\OrderStatus;
use Carbon\CarbonInterface;
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

        $ordersCount = Order::count();
        $revenueCents = (int) Order::sum('total_cents');

        return response()->json([
            'data' => [
                'metrics' => [
                    'orders_count' => $ordersCount,
                    'pending_orders_count' => Order::where('status', OrderStatus::Pending->value)->count(),
                    'products_count' => Product::where('is_active', true)->count(),
                    'categories_count' => ProductCategory::where('is_visible', true)->count(),
                    'revenue_cents' => $revenueCents,
                    'average_order_cents' => $ordersCount > 0 ? (int) round($revenueCents / $ordersCount) : 0,
                    'pending_revenue_cents' => (int) Order::where('status', OrderStatus::Pending->value)->sum('total_cents'),
                    'units_sold_count' => (int) OrderItem::sum('quantity'),
                ],
                'recentOrders' => $recentOrders,
                'lowStockProducts' => $lowStockProducts,
                'salesSeries' => [
                    'week' => $this->salesSeries('day', 7),
                    'month' => $this->salesSeries('month', 6),
                    'year' => $this->salesSeries('year', 5),
                ],
                'statusBreakdown' => $this->statusBreakdown(),
                'topProducts' => $this->topProducts(),
            ],
        ]);
    }

    /**
     * @return array<int, array{label: string, revenue_cents: int, orders_count: int}>
     */
    private function salesSeries(string $unit, int $count): array
    {
        $start = match ($unit) {
            'month' => now()->subMonths($count - 1)->startOfMonth(),
            'year' => now()->subYears($count - 1)->startOfYear(),
            default => now()->subDays($count - 1)->startOfDay(),
        };

        $orders = Order::query()
            ->select(['id', 'total_cents', 'created_at'])
            ->where('created_at', '>=', $start)
            ->get();

        return collect(range(0, $count - 1))
            ->map(function (int $index) use ($orders, $start, $unit): array {
                $periodStart = $this->periodDate($start, $unit, $index);
                $periodEnd = $this->periodEnd($periodStart, $unit);
                $periodOrders = $orders->filter(
                    fn (Order $order): bool => $order->created_at !== null
                        && $order->created_at->betweenIncluded($periodStart, $periodEnd),
                );

                return [
                    'label' => $this->periodLabel($periodStart, $unit),
                    'revenue_cents' => (int) $periodOrders->sum('total_cents'),
                    'orders_count' => $periodOrders->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array<int, array{status: string, label: string, count: int}>
     */
    private function statusBreakdown(): array
    {
        $counts = Order::query()
            ->selectRaw('status, COUNT(*) as aggregate')
            ->groupBy('status')
            ->pluck('aggregate', 'status');

        return collect(OrderStatus::cases())
            ->map(fn (OrderStatus $status): array => [
                'status' => $status->value,
                'label' => str($status->value)->replace('_', ' ')->title()->value(),
                'count' => (int) ($counts[$status->value] ?? 0),
            ])
            ->all();
    }

    /**
     * @return array<int, array{product_name: string, quantity: int, revenue_cents: int}>
     */
    private function topProducts(): array
    {
        return OrderItem::query()
            ->selectRaw('product_name, COALESCE(SUM(quantity), 0) as quantity, COALESCE(SUM(line_total_cents), 0) as revenue_cents')
            ->where('created_at', '>=', now()->subDays(30)->startOfDay())
            ->groupBy('product_name')
            ->orderByDesc('revenue_cents')
            ->limit(5)
            ->get()
            ->map(fn (OrderItem $item): array => [
                'product_name' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'revenue_cents' => (int) $item->revenue_cents,
            ])
            ->all();
    }

    private function periodDate(CarbonInterface $start, string $unit, int $index): CarbonInterface
    {
        return match ($unit) {
            'month' => $start->copy()->addMonths($index),
            'year' => $start->copy()->addYears($index),
            default => $start->copy()->addDays($index),
        };
    }

    private function periodEnd(CarbonInterface $date, string $unit): CarbonInterface
    {
        return match ($unit) {
            'month' => $date->copy()->endOfMonth(),
            'year' => $date->copy()->endOfYear(),
            default => $date->copy()->endOfDay(),
        };
    }

    private function periodLabel(CarbonInterface $date, string $unit): string
    {
        return match ($unit) {
            'month' => $date->format('M'),
            'year' => $date->format('Y'),
            default => $date->format('D'),
        };
    }
}
