import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CalendarDays,
    CircleDollarSign,
    Package,
    ShoppingBag,
    Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate, formatMoney, titleCase } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import { dashboard as dashboardApi } from '@/routes/api/admin';
import { index as ordersIndex } from '@/routes/dashboard/orders';
import { index as productsIndex } from '@/routes/dashboard/products';

type Metrics = {
    orders_count: number;
    sales_count: number;
    counter_sales_count: number;
    pending_orders_count: number;
    products_count: number;
    categories_count: number;
    revenue_cents: number;
    average_order_cents: number;
    pending_revenue_cents: number;
    units_sold_count: number;
};

type RecentOrder = {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    total_cents: number;
    currency: string;
    created_at: string;
    items_count: number;
};

type LowStockProduct = {
    id: number;
    name: string;
    price_cents: number;
    currency: string;
    category: { id: number; name: string } | null;
    variants_count: number;
    low_stock_variants_count: number;
};

type SalesPoint = {
    date: string;
    label: string;
    revenue_cents: number;
    orders_count: number;
};

type DailySalesDay = {
    date: string;
    label: string;
    revenue_cents: number;
    orders_count: number;
    online_orders_count: number;
    counter_sales_count: number;
    units_sold_count: number;
};

type DailySales = {
    today: DailySalesDay & {
        average_order_cents: number;
    };
    days: DailySalesDay[];
};

type StatusBreakdown = {
    status: string;
    label: string;
    count: number;
};

type TopProduct = {
    product_name: string;
    quantity: number;
    revenue_cents: number;
};

type SalesRange = 'week' | 'month' | 'year';

type Props = {
    metrics: Metrics;
    recentOrders: RecentOrder[];
    lowStockProducts: LowStockProduct[];
    salesSeries: Record<SalesRange, SalesPoint[]>;
    dailySales: DailySales;
    statusBreakdown: StatusBreakdown[];
    topProducts: TopProduct[];
};

const salesRanges: Array<{ value: SalesRange; label: string }> = [
    { value: 'week', label: '7 days' },
    { value: 'month', label: '6 months' },
    { value: 'year', label: '5 years' },
];

function totalRevenue(points: SalesPoint[]): number {
    return points.reduce((total, point) => total + point.revenue_cents, 0);
}

function totalSales(points: SalesPoint[]): number {
    return points.reduce((total, point) => total + point.orders_count, 0);
}

function SalesChart({ points }: { points: SalesPoint[] }) {
    const chartWidth = 800;
    const paddingLeft = 76;
    const paddingRight = 16;
    const revenueBaseline = 206;
    const revenueHeight = 166;
    const salesBaseline = 310;
    const salesHeight = 48;
    const peakRevenue = Math.max(
        ...points.map((point) => point.revenue_cents),
        100,
    );
    const magnitude = 10 ** Math.floor(Math.log10(peakRevenue));
    const maxRevenue = Math.ceil(peakRevenue / magnitude) * magnitude;
    const maxOrders = Math.max(...points.map((point) => point.orders_count), 1);
    const slotWidth =
        (chartWidth - paddingLeft - paddingRight) / Math.max(points.length, 1);
    const barWidth = Math.min(54, slotWidth * 0.52);
    const pointX = (index: number) => paddingLeft + slotWidth * (index + 0.5);
    const salesY = (count: number) =>
        salesBaseline - (count / maxOrders) * salesHeight;
    const linePoints = points
        .map((point, index) => `${pointX(index)},${salesY(point.orders_count)}`)
        .join(' ');

    return (
        <div className="overflow-x-auto">
            <svg
                className="block w-full min-w-[560px]"
                viewBox={`0 0 ${chartWidth} 354`}
                role="img"
                aria-label="Revenue in euros and sale counts, aligned by period. Exact values are in the table below."
            >
                <text
                    x={paddingLeft}
                    y={18}
                    className="fill-emerald-700 text-[12px] font-medium dark:fill-emerald-400"
                >
                    Revenue (EUR)
                </text>
                {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
                    const y = revenueBaseline - revenueHeight * fraction;

                    return (
                        <g key={fraction}>
                            <line
                                x1={paddingLeft}
                                x2={chartWidth - paddingRight}
                                y1={y}
                                y2={y}
                                className="stroke-border"
                                strokeDasharray={
                                    fraction === 0 ? undefined : '3 5'
                                }
                            />
                            <text
                                x={paddingLeft - 12}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-muted-foreground text-[11px]"
                            >
                                {new Intl.NumberFormat('en', {
                                    maximumFractionDigits: 2,
                                    notation: 'compact',
                                }).format((maxRevenue * fraction) / 100)}
                            </text>
                        </g>
                    );
                })}
                <text
                    x={paddingLeft}
                    y={244}
                    className="fill-sky-700 text-[12px] font-medium dark:fill-sky-400"
                >
                    Sales (count)
                </text>
                {[0, maxOrders].map((count) => (
                    <g key={count}>
                        <line
                            x1={paddingLeft}
                            x2={chartWidth - paddingRight}
                            y1={salesY(count)}
                            y2={salesY(count)}
                            className="stroke-border"
                            strokeDasharray={count === 0 ? undefined : '3 5'}
                        />
                        <text
                            x={paddingLeft - 12}
                            y={salesY(count) + 4}
                            textAnchor="end"
                            className="fill-muted-foreground text-[11px]"
                        >
                            {count}
                        </text>
                    </g>
                ))}
                <polyline
                    points={linePoints}
                    fill="none"
                    strokeWidth={2}
                    strokeLinejoin="round"
                    className="stroke-sky-500"
                />
                {points.map((point, index) => {
                    const x = pointX(index);
                    const height =
                        (point.revenue_cents / maxRevenue) * revenueHeight;
                    const description = `${point.label}: ${formatMoney(point.revenue_cents)}, ${point.orders_count} sales`;

                    return (
                        <g
                            key={point.date}
                            tabIndex={0}
                            aria-label={description}
                            className="group outline-none"
                        >
                            <title>{description}</title>
                            <rect
                                x={x - slotWidth / 2}
                                y={28}
                                width={slotWidth}
                                height={290}
                                className="fill-transparent group-hover:fill-muted/40 group-focus:fill-muted/40"
                            />
                            <rect
                                x={x - barWidth / 2}
                                y={revenueBaseline - height}
                                width={barWidth}
                                height={height}
                                rx={2}
                                className="fill-emerald-500"
                            />
                            <circle
                                cx={x}
                                cy={salesY(point.orders_count)}
                                r={4}
                                className="fill-background stroke-sky-500"
                                strokeWidth={2}
                            />
                            <text
                                x={x}
                                y={338}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[11px]"
                            >
                                {point.label}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

function ProgressRow({
    label,
    value,
    max,
    detail,
}: {
    label: string;
    value: number;
    max: number;
    detail: string;
}) {
    const percent =
        max > 0 ? Math.max((value / max) * 100, value > 0 ? 4 : 0) : 0;

    return (
        <div className="grid gap-2">
            <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate font-medium">{label}</span>
                <span className="shrink-0 text-muted-foreground">{detail}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
                <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    );
}

export default function AdminDashboard() {
    const { data, error } = useAdminApi<Props>(dashboardApi.url());
    const [salesRange, setSalesRange] = useState<SalesRange>('week');

    const statusMax = useMemo(
        () =>
            Math.max(
                ...(data?.statusBreakdown.map((status) => status.count) ?? [0]),
                1,
            ),
        [data?.statusBreakdown],
    );

    if (!data) {
        return (
            <>
                <Head title="Admin Dashboard" />
                <AdminApiState error={error} />
            </>
        );
    }

    const {
        metrics,
        recentOrders,
        lowStockProducts,
        salesSeries,
        dailySales,
        statusBreakdown,
        topProducts,
    } = data;
    const activeSeries = salesSeries[salesRange];
    const rangeRevenue = totalRevenue(activeSeries);
    const rangeSales = totalSales(activeSeries);
    const topProductMax = Math.max(
        ...topProducts.map((product) => product.revenue_cents),
        1,
    );
    const metricCards = [
        {
            title: 'Sales revenue',
            value: formatMoney(metrics.revenue_cents),
            detail: `${formatMoney(metrics.pending_revenue_cents)} pending`,
            icon: Wallet,
        },
        {
            title: 'Sales',
            value: metrics.sales_count.toLocaleString(),
            detail: `${metrics.orders_count.toLocaleString()} online · ${metrics.counter_sales_count.toLocaleString()} counter`,
            icon: ShoppingBag,
        },
        {
            title: 'Average sale',
            value: formatMoney(metrics.average_order_cents),
            detail: `${metrics.units_sold_count.toLocaleString()} units sold`,
            icon: CircleDollarSign,
        },
        {
            title: 'Catalog',
            value: metrics.products_count.toLocaleString(),
            detail: `${metrics.categories_count.toLocaleString()} visible categories`,
            icon: Package,
        },
    ];

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Admin Dashboard
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Store activity, catalog health, and orders that need
                            attention.
                        </p>
                    </div>
                    <Button asChild>
                        <Link href={ordersIndex()}>
                            View orders
                            <ArrowRight />
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {metricCards.map((metric) => (
                        <Card key={metric.title} className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {metric.title}
                                </CardTitle>
                                <metric.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="grid gap-2">
                                <div className="text-2xl font-semibold">
                                    {metric.value}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {metric.detail}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.75fr)]">
                    <div className="grid min-w-0 gap-4">
                        <Card className="min-w-0 rounded-lg">
                            <CardHeader className="gap-4">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div>
                                        <CardTitle>Sales trend</CardTitle>
                                        <CardDescription>
                                            Online orders and counter sales,
                                            including pending orders
                                        </CardDescription>
                                    </div>
                                    <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
                                        {salesRanges.map((range) => (
                                            <Button
                                                key={range.value}
                                                type="button"
                                                size="sm"
                                                aria-pressed={
                                                    salesRange === range.value
                                                }
                                                variant={
                                                    salesRange === range.value
                                                        ? 'secondary'
                                                        : 'ghost'
                                                }
                                                onClick={() =>
                                                    setSalesRange(range.value)
                                                }
                                            >
                                                {range.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Range revenue
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {formatMoney(rangeRevenue)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Range sales
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {rangeSales.toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">
                                            Average sale
                                        </p>
                                        <p className="text-lg font-semibold">
                                            {formatMoney(
                                                rangeSales > 0
                                                    ? Math.round(
                                                          rangeRevenue /
                                                              rangeSales,
                                                      )
                                                    : 0,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <SalesChart points={activeSeries} />
                                <div className="mt-4 overflow-x-auto border-t">
                                    <table className="w-full text-sm tabular-nums">
                                        <caption className="sr-only">
                                            Exact sales totals for the selected
                                            period
                                        </caption>
                                        <thead>
                                            <tr className="border-b text-xs text-muted-foreground">
                                                <th
                                                    scope="col"
                                                    className="py-3 text-left font-medium"
                                                >
                                                    Period
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="py-3 text-right font-medium"
                                                >
                                                    Revenue
                                                </th>
                                                <th
                                                    scope="col"
                                                    className="py-3 text-right font-medium"
                                                >
                                                    Sales
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {activeSeries.map((point) => (
                                                <tr
                                                    key={point.date}
                                                    className="border-b last:border-0 hover:bg-muted/40"
                                                >
                                                    <th
                                                        scope="row"
                                                        className="py-2.5 text-left font-normal whitespace-nowrap"
                                                    >
                                                        {point.label}
                                                    </th>
                                                    <td className="py-2.5 text-right">
                                                        {formatMoney(
                                                            point.revenue_cents,
                                                        )}
                                                    </td>
                                                    <td className="py-2.5 text-right">
                                                        {point.orders_count.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t font-semibold">
                                                <th
                                                    scope="row"
                                                    className="pt-3 text-left"
                                                >
                                                    Total
                                                </th>
                                                <td className="pt-3 text-right">
                                                    {formatMoney(rangeRevenue)}
                                                </td>
                                                <td className="pt-3 text-right">
                                                    {rangeSales.toLocaleString()}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Recent Orders</CardTitle>
                                    <CardDescription>
                                        Fresh activity from the storefront
                                    </CardDescription>
                                </div>
                                <Badge variant="secondary">
                                    {metrics.pending_orders_count} pending
                                </Badge>
                            </CardHeader>
                            <CardContent className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="py-3 font-medium">
                                                Order
                                            </th>
                                            <th className="py-3 font-medium">
                                                Customer
                                            </th>
                                            <th className="py-3 font-medium">
                                                Items
                                            </th>
                                            <th className="py-3 font-medium">
                                                Status
                                            </th>
                                            <th className="py-3 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.map((order) => (
                                            <tr
                                                key={order.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3">
                                                    <div className="font-medium">
                                                        {order.order_number}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            order.created_at,
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    <div>
                                                        {
                                                            order.customer_first_name
                                                        }{' '}
                                                        {
                                                            order.customer_last_name
                                                        }
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {order.customer_email}
                                                    </div>
                                                </td>
                                                <td className="py-3">
                                                    {order.items_count}
                                                </td>
                                                <td className="py-3">
                                                    <Badge variant="outline">
                                                        {titleCase(
                                                            order.status,
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right font-medium">
                                                    {formatMoney(
                                                        order.total_cents,
                                                        order.currency,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid min-w-0 gap-4">
                        <Card className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Daily sales</CardTitle>
                                    <CardDescription>
                                        {dailySales.today.label}
                                    </CardDescription>
                                </div>
                                <CalendarDays className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="grid gap-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="min-w-0 py-2">
                                        <p className="text-xs text-muted-foreground">
                                            Today revenue
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {formatMoney(
                                                dailySales.today.revenue_cents,
                                            )}
                                        </p>
                                    </div>
                                    <div className="min-w-0 py-2">
                                        <p className="text-xs text-muted-foreground">
                                            Today sales
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {dailySales.today.orders_count.toLocaleString()}
                                        </p>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {dailySales.today.online_orders_count.toLocaleString()}{' '}
                                            online ·{' '}
                                            {dailySales.today.counter_sales_count.toLocaleString()}{' '}
                                            counter
                                        </p>
                                    </div>
                                    <div className="min-w-0 py-2">
                                        <p className="text-xs text-muted-foreground">
                                            Units sold
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {dailySales.today.units_sold_count.toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="min-w-0 py-2">
                                        <p className="text-xs text-muted-foreground">
                                            Average sale
                                        </p>
                                        <p className="mt-1 text-lg font-semibold">
                                            {formatMoney(
                                                dailySales.today
                                                    .average_order_cents,
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Order status</CardTitle>
                                <CardDescription>
                                    Current pipeline by fulfillment stage
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {statusBreakdown.map((status) => (
                                    <ProgressRow
                                        key={status.status}
                                        label={status.label}
                                        value={status.count}
                                        max={statusMax}
                                        detail={status.count.toLocaleString()}
                                    />
                                ))}
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle>Top products</CardTitle>
                                <CardDescription>
                                    Best revenue contributors in the last 30
                                    days
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {topProducts.length === 0 ? (
                                    <p className="text-sm text-muted-foreground">
                                        No product sales yet.
                                    </p>
                                ) : (
                                    topProducts.map((product) => (
                                        <ProgressRow
                                            key={product.product_name}
                                            label={product.product_name}
                                            value={product.revenue_cents}
                                            max={topProductMax}
                                            detail={`${product.quantity.toLocaleString()} sold · ${formatMoney(product.revenue_cents)}`}
                                        />
                                    ))
                                )}
                            </CardContent>
                        </Card>
                        <Card className="rounded-lg">
                            <CardHeader className="flex flex-row items-center justify-between gap-3">
                                <div>
                                    <CardTitle>Inventory Watch</CardTitle>
                                    <CardDescription>
                                        Active products with variants running
                                        low
                                    </CardDescription>
                                </div>
                                <AlertTriangle className="h-4 w-4 text-amber-600" />
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                {lowStockProducts.length === 0 ? (
                                    <div className="grid gap-2 rounded-md border border-dashed p-4 text-sm text-muted-foreground">
                                        <Boxes className="h-4 w-4" />
                                        No low-stock variants.
                                    </div>
                                ) : (
                                    lowStockProducts.map((product) => (
                                        <div
                                            key={product.id}
                                            className="flex items-center justify-between gap-4 border-b pb-4 last:border-0 last:pb-0"
                                        >
                                            <div>
                                                <div className="font-medium">
                                                    {product.name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {product.category?.name ??
                                                        'Uncategorized'}{' '}
                                                    · {product.variants_count}{' '}
                                                    variants
                                                </div>
                                            </div>
                                            <Badge variant="destructive">
                                                {
                                                    product.low_stock_variants_count
                                                }{' '}
                                                low
                                            </Badge>
                                        </div>
                                    ))
                                )}
                                <Button variant="outline" asChild>
                                    <Link href={productsIndex()}>
                                        Review products
                                    </Link>
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </>
    );
}

AdminDashboard.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
    ],
};
