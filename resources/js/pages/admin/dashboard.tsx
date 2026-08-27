import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Boxes,
    CircleDollarSign,
    Package,
    ShoppingBag,
    Tags,
    TrendingUp,
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
    label: string;
    revenue_cents: number;
    orders_count: number;
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
    statusBreakdown: StatusBreakdown[];
    topProducts: TopProduct[];
};

const salesRanges: Array<{ value: SalesRange; label: string }> = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
];

function totalRevenue(points: SalesPoint[]): number {
    return points.reduce((total, point) => total + point.revenue_cents, 0);
}

function totalOrders(points: SalesPoint[]): number {
    return points.reduce((total, point) => total + point.orders_count, 0);
}

function SalesChart({ points }: { points: SalesPoint[] }) {
    const chartWidth = 720;
    const chartHeight = 220;
    const padding = 28;
    const innerWidth = chartWidth - padding * 2;
    const innerHeight = chartHeight - padding * 2;
    const maxRevenue = Math.max(
        ...points.map((point) => point.revenue_cents),
        1,
    );
    const maxOrders = Math.max(...points.map((point) => point.orders_count), 1);
    const barWidth = innerWidth / points.length - 14;
    const linePoints = points
        .map((point, index) => {
            const x =
                padding + index * (innerWidth / Math.max(points.length - 1, 1));
            const y =
                padding +
                innerHeight -
                (point.orders_count / maxOrders) * innerHeight;

            return `${x},${y}`;
        })
        .join(' ');

    return (
        <div className="overflow-hidden rounded-md border bg-muted/20">
            <svg
                className="h-[260px] w-full"
                viewBox={`0 0 ${chartWidth} ${chartHeight + 38}`}
                role="img"
                aria-label="Sales and order trend chart"
            >
                <line
                    x1={padding}
                    x2={chartWidth - padding}
                    y1={chartHeight - padding}
                    y2={chartHeight - padding}
                    className="stroke-border"
                />
                {points.map((point, index) => {
                    const x =
                        padding +
                        index * (innerWidth / points.length) +
                        (innerWidth / points.length - barWidth) / 2;
                    const height =
                        (point.revenue_cents / maxRevenue) * innerHeight;
                    const y = padding + innerHeight - height;

                    return (
                        <g key={point.label}>
                            <rect
                                x={x}
                                y={y}
                                width={barWidth}
                                height={Math.max(height, 2)}
                                rx={4}
                                className="fill-emerald-500/70"
                            />
                            <text
                                x={x + barWidth / 2}
                                y={chartHeight + 12}
                                textAnchor="middle"
                                className="fill-muted-foreground text-[11px]"
                            >
                                {point.label}
                            </text>
                        </g>
                    );
                })}
                <polyline
                    points={linePoints}
                    fill="none"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="stroke-sky-500"
                />
                {points.map((point, index) => {
                    const x =
                        padding +
                        index * (innerWidth / Math.max(points.length - 1, 1));
                    const y =
                        padding +
                        innerHeight -
                        (point.orders_count / maxOrders) * innerHeight;

                    return (
                        <circle
                            key={`${point.label}-orders`}
                            cx={x}
                            cy={y}
                            r={4}
                            className="fill-background stroke-sky-500"
                            strokeWidth={2}
                        />
                    );
                })}
            </svg>
            <div className="flex flex-wrap gap-4 border-t px-4 py-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-sm bg-emerald-500/70" />
                    Revenue
                </span>
                <span className="inline-flex items-center gap-2">
                    <span className="h-0.5 w-5 rounded-full bg-sky-500" />
                    Orders
                </span>
            </div>
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
        statusBreakdown,
        topProducts,
    } = data;
    const activeSeries = salesSeries[salesRange];
    const rangeRevenue = totalRevenue(activeSeries);
    const rangeOrders = totalOrders(activeSeries);
    const topProductMax = Math.max(
        ...topProducts.map((product) => product.revenue_cents),
        1,
    );
    const metricCards = [
        {
            title: 'Revenue',
            value: formatMoney(metrics.revenue_cents),
            detail: `${formatMoney(metrics.pending_revenue_cents)} pending`,
            icon: Wallet,
        },
        {
            title: 'Orders',
            value: metrics.orders_count.toLocaleString(),
            detail: `${metrics.pending_orders_count.toLocaleString()} pending`,
            icon: ShoppingBag,
        },
        {
            title: 'Avg order',
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

                <div className="grid gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.75fr)]">
                    <Card className="rounded-lg">
                        <CardHeader className="gap-4">
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                    <CardTitle>Sales trend</CardTitle>
                                    <CardDescription>
                                        Revenue bars with order volume overlaid
                                    </CardDescription>
                                </div>
                                <div className="flex gap-1 rounded-md border bg-muted/30 p-1">
                                    {salesRanges.map((range) => (
                                        <Button
                                            key={range.value}
                                            type="button"
                                            size="sm"
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
                                        Range orders
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {rangeOrders.toLocaleString()}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground">
                                        Range AOV
                                    </p>
                                    <p className="text-lg font-semibold">
                                        {formatMoney(
                                            rangeOrders > 0
                                                ? Math.round(
                                                      rangeRevenue /
                                                          rangeOrders,
                                                  )
                                                : 0,
                                        )}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SalesChart points={activeSeries} />
                        </CardContent>
                    </Card>

                    <div className="grid gap-4">
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
                    </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.45fr_0.9fr]">
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
                                                    {order.customer_first_name}{' '}
                                                    {order.customer_last_name}
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
                                                    {titleCase(order.status)}
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

                    <Card className="rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <div>
                                <CardTitle>Inventory Watch</CardTitle>
                                <CardDescription>
                                    Active products with variants running low
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
                                            {product.low_stock_variants_count}{' '}
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

                <Card className="rounded-lg">
                    <CardContent className="grid gap-4 py-5 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-md bg-emerald-500/10 text-emerald-700">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Active range
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {salesRanges.find(
                                        (range) => range.value === salesRange,
                                    )?.label ?? 'Week'}{' '}
                                    is selected for the trend view.
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-md bg-sky-500/10 text-sky-700">
                                <ShoppingBag className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Orders to clear
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.pending_orders_count.toLocaleString()}{' '}
                                    pending orders worth{' '}
                                    {formatMoney(metrics.pending_revenue_cents)}
                                    .
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="grid size-10 place-items-center rounded-md bg-amber-500/10 text-amber-700">
                                <Tags className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium">
                                    Catalog coverage
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {metrics.products_count.toLocaleString()}{' '}
                                    active products across{' '}
                                    {metrics.categories_count.toLocaleString()}{' '}
                                    categories.
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
