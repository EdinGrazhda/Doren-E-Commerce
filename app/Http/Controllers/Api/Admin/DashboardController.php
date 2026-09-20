<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductCategory;
use App\OrderStatus;
use App\PaymentStatus;
use Carbon\CarbonInterface;
use Illuminate\Database\Eloquent\Builder;
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

        $ordersCount = $this->salesOrders()->count();
        $counterTotals = $this->counterSales()
            ->selectRaw('COUNT(*) as sales_count, COALESCE(SUM(quantity), 0) as units_count, COALESCE(SUM(quantity * unit_amount_cents), 0) as revenue_cents')
            ->first();
        $salesCount = $ordersCount + (int) $counterTotals->sales_count;
        $revenueCents = (int) $this->salesOrders()->sum('total_cents') + (int) $counterTotals->revenue_cents;

        return response()->json([
            'data' => [
                'metrics' => [
                    'orders_count' => $ordersCount,
                    'sales_count' => $salesCount,
                    'counter_sales_count' => (int) $counterTotals->sales_count,
                    'pending_orders_count' => Order::where('status', OrderStatus::Pending->value)->count(),
                    'products_count' => Product::where('is_active', true)->count(),
                    'categories_count' => ProductCategory::where('is_visible', true)->count(),
                    'revenue_cents' => $revenueCents,
                    'average_order_cents' => $salesCount > 0 ? (int) round($revenueCents / $salesCount) : 0,
                    'pending_revenue_cents' => (int) $this->salesOrders()->where('status', OrderStatus::Pending)->sum('total_cents'),
                    'units_sold_count' => (int) OrderItem::whereIn('order_id', $this->salesOrders()->select('id'))->sum('quantity') + (int) $counterTotals->units_count,
                ],
                'recentOrders' => $recentOrders,
                'lowStockProducts' => $lowStockProducts,
                'salesSeries' => [
                    'week' => $this->salesSeries('day', 7),
                    'month' => $this->salesSeries('month', 6),
                    'year' => $this->salesSeries('year', 5),
                ],
                'dailySales' => $this->dailySales(),
                'statusBreakdown' => $this->statusBreakdown(),
                'topProducts' => $this->topProducts(),
            ],
        ]);
    }

    /**
     * @return array<int, array{date: string, label: string, revenue_cents: int, orders_count: int}>
     */
    private function salesSeries(string $unit, int $count): array
    {
        $start = match ($unit) {
            'month' => now()->startOfMonth()->subMonths($count - 1),
            'year' => now()->startOfYear()->subYears($count - 1),
            default => now()->subDays($count - 1)->startOfDay(),
        };

        $orders = $this->salesOrders()
            ->select(['id', 'total_cents', 'created_at'])
            ->where('created_at', '>=', $start)
            ->get();

        $counterSales = $this->counterSales()
            ->select(['id', 'quantity', 'unit_amount_cents', 'created_at'])
            ->where('created_at', '>=', $start)
            ->get();

        return collect(range(0, $count - 1))
            ->map(function (int $index) use ($counterSales, $orders, $start, $unit): array {
                $periodStart = $this->periodDate($start, $unit, $index);
                $periodEnd = $this->periodEnd($periodStart, $unit);
                $periodOrders = $orders->filter(
                    fn (Order $order): bool => $order->created_at !== null
                        && $order->created_at->betweenIncluded($periodStart, $periodEnd),
                );
                $periodCounterSales = $counterSales->filter(
                    fn (InventoryMovement $movement): bool => $movement->created_at !== null
                        && $movement->created_at->betweenIncluded($periodStart, $periodEnd),
                );
                $counterRevenueCents = $periodCounterSales->sum(
                    fn (InventoryMovement $movement): int => $movement->quantity * ($movement->unit_amount_cents ?? 0),
                );

                return [
                    'label' => $this->periodLabel($periodStart, $unit),
                    'date' => $periodStart->toDateString(),
                    'revenue_cents' => (int) $periodOrders->sum('total_cents') + (int) $counterRevenueCents,
                    'orders_count' => $periodOrders->count() + $periodCounterSales->count(),
                ];
            })
            ->values()
            ->all();
    }

    /**
     * @return array{today: array{date: string, label: string, revenue_cents: int, orders_count: int, online_orders_count: int, counter_sales_count: int, units_sold_count: int, average_order_cents: int}, days: array<int, array{date: string, label: string, revenue_cents: int, orders_count: int, online_orders_count: int, counter_sales_count: int, units_sold_count: int}>}
     */
    private function dailySales(): array
    {
        $start = now()->subDays(6)->startOfDay();

        $ordersByDay = $this->salesOrders()
            ->selectRaw('DATE(created_at) as sale_date, COALESCE(SUM(total_cents), 0) as revenue_cents, COUNT(*) as orders_count')
            ->where('created_at', '>=', $start)
            ->groupBy('sale_date')
            ->get()
            ->keyBy('sale_date');

        $unitsByDay = OrderItem::query()
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->whereIn('orders.id', $this->salesOrders()->select('id'))
            ->selectRaw('DATE(orders.created_at) as sale_date, COALESCE(SUM(order_items.quantity), 0) as units_sold_count')
            ->where('orders.created_at', '>=', $start)
            ->groupBy('sale_date')
            ->pluck('units_sold_count', 'sale_date');

        $counterSalesByDay = $this->counterSales()
            ->selectRaw('DATE(created_at) as sale_date')
            ->selectRaw('COALESCE(SUM(quantity * COALESCE(unit_amount_cents, 0)), 0) as revenue_cents')
            ->selectRaw('COALESCE(SUM(quantity), 0) as units_sold_count')
            ->selectRaw('COUNT(*) as counter_sales_count')
            ->where('created_at', '>=', $start)
            ->groupBy('sale_date')
            ->get()
            ->keyBy('sale_date');

        $days = collect(range(0, 6))
            ->map(function (int $index) use ($counterSalesByDay, $ordersByDay, $start, $unitsByDay): array {
                $date = $start->copy()->addDays($index);
                $dateKey = $date->toDateString();
                $orders = $ordersByDay->get($dateKey);
                $counterSales = $counterSalesByDay->get($dateKey);
                $onlineOrdersCount = (int) ($orders->orders_count ?? 0);
                $counterSalesCount = (int) ($counterSales->counter_sales_count ?? 0);

                return [
                    'date' => $dateKey,
                    'label' => $date->format('D, M j'),
                    'revenue_cents' => (int) ($orders->revenue_cents ?? 0) + (int) ($counterSales->revenue_cents ?? 0),
                    'orders_count' => $onlineOrdersCount + $counterSalesCount,
                    'online_orders_count' => $onlineOrdersCount,
                    'counter_sales_count' => $counterSalesCount,
                    'units_sold_count' => (int) ($unitsByDay[$dateKey] ?? 0) + (int) ($counterSales->units_sold_count ?? 0),
                ];
            })
            ->values()
            ->all();

        $today = $days[array_key_last($days)] ?? [
            'revenue_cents' => 0,
            'orders_count' => 0,
            'online_orders_count' => 0,
            'counter_sales_count' => 0,
            'units_sold_count' => 0,
        ];

        return [
            'today' => [
                ...$today,
                'average_order_cents' => $today['orders_count'] > 0
                    ? (int) round($today['revenue_cents'] / $today['orders_count'])
                    : 0,
            ],
            'days' => $days,
        ];
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
        $onlineProducts = OrderItem::query()
            ->selectRaw('product_name, COALESCE(SUM(quantity), 0) as quantity, COALESCE(SUM(line_total_cents), 0) as revenue_cents')
            ->whereIn('order_id', $this->salesOrders()->where('created_at', '>=', now()->subDays(29)->startOfDay())->select('id'))
            ->groupBy('product_name')
            ->get()
            ->map(fn (OrderItem $item): array => [
                'product_name' => $item->product_name,
                'quantity' => (int) $item->quantity,
                'revenue_cents' => (int) $item->revenue_cents,
            ])
            ->all();

        $counterProducts = $this->counterSales()
            ->selectRaw('product_name, COALESCE(SUM(quantity), 0) as quantity, COALESCE(SUM(quantity * unit_amount_cents), 0) as revenue_cents')
            ->where('created_at', '>=', now()->subDays(29)->startOfDay())
            ->groupBy('product_name')
            ->get()
            ->map(fn (InventoryMovement $movement): array => [
                'product_name' => $movement->product_name,
                'quantity' => (int) $movement->quantity,
                'revenue_cents' => (int) $movement->revenue_cents,
            ]);

        return collect($onlineProducts)->concat($counterProducts)
            ->groupBy('product_name')
            ->map(fn ($products, string $name): array => [
                'product_name' => $name,
                'quantity' => (int) $products->sum('quantity'),
                'revenue_cents' => (int) $products->sum('revenue_cents'),
            ])
            ->sortByDesc('revenue_cents')
            ->take(5)
            ->values()
            ->all();
    }

    /** @return Builder<Order> */
    private function salesOrders(): Builder
    {
        return Order::query()
            ->where('status', '!=', OrderStatus::Cancelled)
            ->whereNotIn('payment_status', [PaymentStatus::Failed, PaymentStatus::Refunded])
            ->where('created_at', '<=', now());
    }

    /** @return Builder<InventoryMovement> */
    private function counterSales(): Builder
    {
        return InventoryMovement::query()
            ->where('type', InventoryMovementType::Sold)
            ->where('created_at', '<=', now());
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
            'month' => $date->format('M Y'),
            'year' => $date->format('Y'),
            default => $date->format('D, M j'),
        };
    }
}
