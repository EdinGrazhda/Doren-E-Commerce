import { Head, useHttp } from '@inertiajs/react';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { AdminPagination } from '@/components/admin-pagination';
import type { AdminPaginationMeta } from '@/components/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate, formatMoney, titleCase } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import {
    destroy as destroyOrder,
    index as ordersApiIndex,
    update as updateOrder,
} from '@/routes/api/admin/orders';
import { index as ordersIndex } from '@/routes/dashboard/orders';

type Order = {
    id: number;
    order_number: string;
    status: string;
    payment_status: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    shipping_city: string;
    total_cents: number;
    currency: string;
    created_at: string;
    items_count: number;
};

type Option = {
    label: string;
    value: string;
};

type Props = {
    orders: AdminPaginationMeta<Order>;
    statusOptions: Option[];
    paymentStatusOptions: Option[];
};

type OrderFormData = {
    status: string;
    payment_status: string;
};

export default function AdminOrdersIndex() {
    const [editingOrder, setEditingOrder] = useState<Order | null>(null);
    const [ordersPageUrl, setOrdersPageUrl] = useState(ordersApiIndex.url());
    const listing = useAdminApi<Props>(ordersPageUrl);
    const form = useHttp<OrderFormData>({
        status: '',
        payment_status: '',
    });
    const deleteRequest = useHttp<Record<string, never>>({});

    if (!listing.data) {
        return (
            <>
                <Head title="Admin Orders" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { orders, statusOptions, paymentStatusOptions } = listing.data;

    const openStatusDialog = (order: Order) => {
        setEditingOrder(order);
        form.clearErrors();
        form.setData({
            status: order.status,
            payment_status: order.payment_status,
        });
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!editingOrder) {
            return;
        }

        void form.put(updateOrder.url(editingOrder.id), {
            onSuccess: () => {
                setEditingOrder(null);
                void listing.reload();
            },
        });
    };

    const deleteOrder = (order: Order) => {
        if (!window.confirm(`Delete order ${order.order_number}?`)) {
            return;
        }

        void deleteRequest
            .delete(destroyOrder.url(order.id), {
                onSuccess: () => void listing.reload(),
            })
            .catch(() => undefined);
    };

    return (
        <>
            <Head title="Admin Orders" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Orders
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Guest checkout orders and fulfillment status.
                        </p>
                    </div>
                    <Input className="max-w-xs" placeholder="Search orders" />
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            {orders.total.toLocaleString()} orders
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[860px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="py-3 font-medium">
                                            Order
                                        </th>
                                        <th className="py-3 font-medium">
                                            Customer
                                        </th>
                                        <th className="py-3 font-medium">
                                            City
                                        </th>
                                        <th className="py-3 font-medium">
                                            Items
                                        </th>
                                        <th className="py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="py-3 font-medium">
                                            Payment
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Total
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.data.map((order) => (
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
                                                {order.shipping_city}
                                            </td>
                                            <td className="py-3">
                                                {order.items_count}
                                            </td>
                                            <td className="py-3">
                                                <Badge variant="outline">
                                                    {titleCase(order.status)}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <Badge variant="secondary">
                                                    {titleCase(
                                                        order.payment_status,
                                                    )}
                                                </Badge>
                                            </td>
                                            <td className="py-3 text-right font-medium">
                                                {formatMoney(
                                                    order.total_cents,
                                                    order.currency,
                                                )}
                                            </td>
                                            <td className="py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openStatusDialog(
                                                                order,
                                                            )
                                                        }
                                                    >
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            deleteOrder(order)
                                                        }
                                                    >
                                                        <Trash2 />
                                                        Delete
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination
                            pagination={orders}
                            onPageChange={setOrdersPageUrl}
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog
                open={editingOrder !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setEditingOrder(null);
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Update order</DialogTitle>
                        <DialogDescription>
                            Change fulfillment and payment status for{' '}
                            {editingOrder?.order_number}.
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label>Status</Label>
                            <Select
                                value={form.data.status}
                                onValueChange={(value) =>
                                    form.setData('status', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {statusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {titleCase(option.value)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.status && (
                                <p className="text-sm text-destructive">
                                    {form.errors.status}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label>Payment</Label>
                            <Select
                                value={form.data.payment_status}
                                onValueChange={(value) =>
                                    form.setData('payment_status', value)
                                }
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {paymentStatusOptions.map((option) => (
                                        <SelectItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {titleCase(option.value)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.errors.payment_status && (
                                <p className="text-sm text-destructive">
                                    {form.errors.payment_status}
                                </p>
                            )}
                        </div>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setEditingOrder(null)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminOrdersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Orders',
            href: ordersIndex(),
        },
    ],
};
