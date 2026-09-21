import { Head, Link } from '@inertiajs/react';
import {
    ArrowLeft,
    CalendarDays,
    Mail,
    MapPin,
    Package,
    Phone,
    UserRound,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate, formatMoney, titleCase } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import { show as orderApiShow } from '@/routes/api/admin/orders';
import { index as ordersIndex } from '@/routes/dashboard/orders';

type OrderItem = {
    id: number;
    product_name: string;
    variant_name: string | null;
    sku: string | null;
    unit_price_cents: number;
    quantity: number;
    line_total_cents: number;
    currency: string;
    product_options: {
        size?: string;
        color?: string;
        color_hex?: string | null;
        image_url?: string | null;
    } | null;
};

type Order = {
    order_number: string;
    status: string;
    payment_status: string;
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    customer_phone: string | null;
    shipping_city: string;
    shipping_street_address: string;
    shipping_address_line_two: string | null;
    shipping_postal_code: string;
    shipping_country_code: string;
    customer_note: string | null;
    subtotal_cents: number;
    shipping_cents: number;
    tax_cents: number;
    discount_cents: number;
    total_cents: number;
    currency: string;
    placed_at: string | null;
    created_at: string | null;
    items: OrderItem[];
};

type Props = {
    orderId: number;
};

function PanelHeading({
    icon: Icon,
    title,
    description,
}: {
    icon: LucideIcon;
    title: string;
    description?: string;
}) {
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-4" />
            </div>
            <div className="grid gap-1">
                <CardTitle>{title}</CardTitle>
                {description && (
                    <p className="text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}

export default function AdminOrderShow({ orderId }: Props) {
    const { data, error } = useAdminApi<Order>(orderApiShow.url(orderId));

    if (!data) {
        return (
            <>
                <Head title="Order details" />
                <AdminApiState error={error} />
            </>
        );
    }

    const order = data;

    return (
        <>
            <Head title={`Order ${order.order_number}`} />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0"
                                asChild
                            >
                                <Link
                                    href={ordersIndex()}
                                    aria-label="Back to orders"
                                >
                                    <ArrowLeft />
                                </Link>
                            </Button>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">
                                    {order.order_number}
                                </h1>
                                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                    <CalendarDays className="size-3.5" />
                                    <span>
                                        Placed{' '}
                                        {formatDate(
                                            order.placed_at ?? order.created_at,
                                        )}
                                    </span>
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                            <Badge variant="outline">
                                {titleCase(order.status)}
                            </Badge>
                            <Badge variant="secondary">
                                {titleCase(order.payment_status)}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
                    <Card>
                        <CardHeader className="border-b bg-muted/20">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-9 items-center justify-center rounded-lg bg-background text-muted-foreground shadow-sm">
                                        <Package className="size-4" />
                                    </div>
                                    <div className="grid gap-1">
                                        <CardTitle>Order items</CardTitle>
                                        <p className="text-sm text-muted-foreground">
                                            {order.items.length}{' '}
                                            {order.items.length === 1
                                                ? 'item'
                                                : 'items'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[720px] text-sm">
                                    <thead>
                                        <tr className="border-b text-left text-xs text-muted-foreground">
                                            <th className="py-3 pr-4 font-medium">
                                                Product
                                            </th>
                                            <th className="px-4 py-3 font-medium">
                                                SKU
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Unit price
                                            </th>
                                            <th className="px-4 py-3 text-right font-medium">
                                                Qty
                                            </th>
                                            <th className="py-3 pl-4 text-right font-medium">
                                                Total
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {order.items.map((item) => (
                                            <tr
                                                key={item.id}
                                                className="border-b align-top last:border-0"
                                            >
                                                <td className="py-4 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        {item.product_options
                                                            ?.image_url && (
                                                            <img
                                                                src={
                                                                    item
                                                                        .product_options
                                                                        .image_url
                                                                }
                                                                alt=""
                                                                className="size-14 rounded-lg border object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <div className="font-medium">
                                                                {
                                                                    item.product_name
                                                                }
                                                            </div>
                                                            <div className="text-xs text-muted-foreground">
                                                                {item
                                                                    .product_options
                                                                    ?.color
                                                                    ? `Color: ${item.product_options.color}`
                                                                    : (item.variant_name ??
                                                                      'Variant not recorded')}
                                                                {item
                                                                    .product_options
                                                                    ?.size &&
                                                                    ` · Size: ${item.product_options.size}`}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-muted-foreground">
                                                    {item.sku ?? '—'}
                                                </td>
                                                <td className="px-4 py-4 text-right whitespace-nowrap">
                                                    {formatMoney(
                                                        item.unit_price_cents,
                                                        item.currency,
                                                    )}
                                                </td>
                                                <td className="px-4 py-4 text-right">
                                                    {item.quantity}
                                                </td>
                                                <td className="py-4 pl-4 text-right font-medium whitespace-nowrap">
                                                    {formatMoney(
                                                        item.line_total_cents,
                                                        item.currency,
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <dl className="mt-6 ml-auto grid w-full max-w-sm gap-3 rounded-lg border bg-muted/20 p-4 text-sm">
                                <div className="flex justify-between gap-6">
                                    <dt className="text-muted-foreground">
                                        Subtotal
                                    </dt>
                                    <dd className="font-medium">
                                        {formatMoney(
                                            order.subtotal_cents,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <dt className="text-muted-foreground">
                                        Shipping
                                    </dt>
                                    <dd>
                                        {formatMoney(
                                            order.shipping_cents,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <dt className="text-muted-foreground">
                                        Tax
                                    </dt>
                                    <dd>
                                        {formatMoney(
                                            order.tax_cents,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-6">
                                    <dt className="text-muted-foreground">
                                        Discount
                                    </dt>
                                    <dd>
                                        {formatMoney(
                                            order.discount_cents,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-6 border-t pt-3 text-base font-semibold">
                                    <dt>Total</dt>
                                    <dd>
                                        {formatMoney(
                                            order.total_cents,
                                            order.currency,
                                        )}
                                    </dd>
                                </div>
                            </dl>
                        </CardContent>
                    </Card>

                    <div className="grid content-start gap-6">
                        <Card>
                            <CardHeader>
                                <PanelHeading
                                    icon={UserRound}
                                    title="Customer"
                                    description="Contact information"
                                />
                            </CardHeader>
                            <CardContent className="grid gap-4">
                                <div className="flex items-start gap-3">
                                    <UserRound className="mt-0.5 size-4 text-muted-foreground" />
                                    <div className="grid gap-1">
                                        <p className="text-xs text-muted-foreground">
                                            Name
                                        </p>
                                        <p className="text-sm font-medium">
                                            {order.customer_first_name}{' '}
                                            {order.customer_last_name}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail className="mt-0.5 size-4 text-muted-foreground" />
                                    <div className="grid gap-1">
                                        <p className="text-xs text-muted-foreground">
                                            Email
                                        </p>
                                        <p className="text-sm break-all">
                                            {order.customer_email}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Phone className="mt-0.5 size-4 text-muted-foreground" />
                                    <div className="grid gap-1">
                                        <p className="text-xs text-muted-foreground">
                                            Phone
                                        </p>
                                        <p className="text-sm">
                                            {order.customer_phone ??
                                                'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <PanelHeading
                                    icon={MapPin}
                                    title="Shipping address"
                                    description="Delivery destination"
                                />
                            </CardHeader>
                            <CardContent>
                                <address className="rounded-lg border bg-muted/20 p-4 text-sm leading-6 not-italic">
                                    {order.shipping_street_address}
                                    <br />
                                    {order.shipping_address_line_two && (
                                        <>
                                            {order.shipping_address_line_two}
                                            <br />
                                        </>
                                    )}
                                    {order.shipping_postal_code}{' '}
                                    {order.shipping_city}
                                    <br />
                                    {order.shipping_country_code}
                                </address>
                            </CardContent>
                        </Card>

                        {order.customer_note && (
                            <Card className="border-amber-200 bg-amber-50/50">
                                <CardHeader>
                                    <CardTitle className="text-base">
                                        Customer note
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="text-sm leading-6 text-muted-foreground">
                                    {order.customer_note}
                                </CardContent>
                            </Card>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

AdminOrderShow.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Orders', href: ordersIndex() },
        { title: 'Details', href: '#' },
    ],
};
