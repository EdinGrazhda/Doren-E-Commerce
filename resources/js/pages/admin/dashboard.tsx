import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    Package,
    ShoppingBag,
    Tags,
    Wallet,
} from 'lucide-react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

type Props = {
    metrics: Metrics;
    recentOrders: RecentOrder[];
    lowStockProducts: LowStockProduct[];
};

export default function AdminDashboard() {
    const { data, error } = useAdminApi<Props>(dashboardApi.url());

    if (!data) {
        return (
            <>
                <Head title="Admin Dashboard" />
                <AdminApiState error={error} />
            </>
        );
    }

    const { metrics, recentOrders, lowStockProducts } = data;
    const metricCards = [
        {
            title: 'Revenue',
            value: formatMoney(metrics.revenue_cents),
            icon: Wallet,
        },
        {
            title: 'Orders',
            value: metrics.orders_count.toLocaleString(),
            icon: ShoppingBag,
        },
        {
            title: 'Products',
            value: metrics.products_count.toLocaleString(),
            icon: Package,
        },
        {
            title: 'Categories',
            value: metrics.categories_count.toLocaleString(),
            icon: Tags,
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
                            <CardContent>
                                <div className="text-2xl font-semibold">
                                    {metric.value}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
                    <Card className="rounded-lg">
                        <CardHeader className="flex flex-row items-center justify-between gap-3">
                            <CardTitle>Recent Orders</CardTitle>
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
                            <CardTitle>Inventory Watch</CardTitle>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            {lowStockProducts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    No low-stock variants.
                                </p>
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
