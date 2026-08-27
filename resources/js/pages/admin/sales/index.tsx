import { Head } from '@inertiajs/react';
import { ArrowUpFromLine, CircleDollarSign, ReceiptText } from 'lucide-react';
import { useState } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { AdminPagination } from '@/components/admin-pagination';
import type { AdminPaginationMeta } from '@/components/admin-pagination';
import { Badge } from '@/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatMoney } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import { index as inventoryApiIndex } from '@/routes/api/admin/inventory';
import { sales as salesIndex } from '@/routes/dashboard';

type SalesMetrics = {
    sales_today: number;
    revenue_today_cents: number;
};

type SalesMovement = {
    id: number;
    type: 'sold';
    quantity: number;
    balance_after: number;
    unit_amount_cents: number | null;
    product_name: string;
    variant_name: string;
    sku: string;
    reference: string | null;
    user: {
        id: number;
        name: string;
    } | null;
    created_at: string;
};

type SalesData = {
    metrics: SalesMetrics;
    movements: AdminPaginationMeta<SalesMovement>;
};

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function AdminSalesIndex() {
    const [listingUrl, setListingUrl] = useState(
        inventoryApiIndex.url({
            query: {
                type: 'sold',
            },
        }),
    );
    const listing = useAdminApi<SalesData>(listingUrl);

    if (!listing.data) {
        return (
            <>
                <Head title="Counter Sales" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { metrics, movements } = listing.data;

    return (
        <>
            <Head title="Counter Sales" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Counter sales
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Review sales recorded by the team from inventory.
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>Sales today</CardDescription>
                            <CircleDollarSign className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="flex items-baseline gap-2 px-4">
                            <span className="text-2xl font-semibold tabular-nums">
                                {metrics.sales_today}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                units
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>Revenue today</CardDescription>
                            <ReceiptText className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-4">
                            <span className="text-2xl font-semibold tabular-nums">
                                {formatMoney(metrics.revenue_today_cents)}
                            </span>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>Sales activity</CardTitle>
                        <CardDescription>
                            Counter sales recorded from inventory
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="py-3 font-medium">
                                            Time
                                        </th>
                                        <th className="py-3 font-medium">
                                            Movement
                                        </th>
                                        <th className="py-3 font-medium">
                                            Product
                                        </th>
                                        <th className="py-3 font-medium">
                                            Reference
                                        </th>
                                        <th className="py-3 font-medium">
                                            Employee
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Balance
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {movements.data.map((movement) => (
                                        <tr
                                            key={movement.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {formatDateTime(
                                                    movement.created_at,
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                <Badge variant="secondary">
                                                    <ArrowUpFromLine />-
                                                    {movement.quantity}
                                                </Badge>
                                            </td>
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">
                                                    {movement.product_name}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {movement.variant_name} /{' '}
                                                    {movement.sku}
                                                </div>
                                            </td>
                                            <td className="py-3 pr-4 text-muted-foreground">
                                                {movement.reference ?? '-'}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {movement.user?.name ??
                                                    'Former user'}
                                            </td>
                                            <td className="py-3 text-right font-semibold tabular-nums">
                                                {movement.balance_after}
                                            </td>
                                        </tr>
                                    ))}
                                    {movements.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                No counter sales recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination
                            pagination={movements}
                            pageParameter="movement_page"
                            onPageChange={setListingUrl}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminSalesIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Counter Sales', href: salesIndex() },
    ],
};
