import { Head, Link, useHttp } from '@inertiajs/react';
import {
    ArrowDownToLine,
    ArrowUpFromLine,
    Boxes,
    CircleDollarSign,
    PackagePlus,
    Search,
    ShoppingCart,
    TriangleAlert,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';

import { AdminApiState } from '@/components/admin-api-state';
import { AdminPagination } from '@/components/admin-pagination';
import type { AdminPaginationMeta } from '@/components/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
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
import { Textarea } from '@/components/ui/textarea';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatMoney } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import {
    index as inventoryApiIndex,
    store as storeInventoryMovement,
} from '@/routes/api/admin/inventory';
import { inventory as inventoryIndex } from '@/routes/dashboard';
import { index as productsIndex } from '@/routes/dashboard/products';

type Product = {
    id: number;
    name: string;
    sku: string | null;
    price_cents: number;
    currency: string;
    primary_image_url: string | null;
    is_active: boolean;
};

type ProductVariant = {
    id: number;
    sku: string;
    size: string;
    color_name: string;
    color_hex: string | null;
    image_url: string | null;
    price_cents: number | null;
    stock_quantity: number;
    reserved_quantity: number;
    is_active: boolean;
    updated_at: string;
    product: Product;
};

type InventoryMovement = {
    id: number;
    type: 'received' | 'sold';
    quantity: number;
    balance_after: number;
    unit_amount_cents: number | null;
    product_name: string;
    variant_name: string;
    sku: string;
    reference: string | null;
    note: string | null;
    created_at: string;
    user: { id: number; name: string } | null;
};

type InventoryMetrics = {
    sku_count: number;
    unit_count: number;
    low_stock_count: number;
    out_of_stock_count: number;
    sales_today: number;
    revenue_today_cents: number;
};

type InventoryData = {
    metrics: InventoryMetrics;
    variants: AdminPaginationMeta<ProductVariant>;
    movements: AdminPaginationMeta<InventoryMovement>;
};

type MovementMode = 'received' | 'sold';

type MovementFormData = {
    product_variant_id: number;
    type: MovementMode;
    quantity: number;
    unit_amount_cents: number | null;
    reference: string;
    note: string;
};

const emptyMovement: MovementFormData = {
    product_variant_id: 0,
    type: 'received',
    quantity: 1,
    unit_amount_cents: null,
    reference: '',
    note: '',
};

const stockFilters = [
    { value: 'all', label: 'All stock' },
    { value: 'healthy', label: 'Healthy' },
    { value: 'low', label: 'Low stock' },
    { value: 'out', label: 'Out of stock' },
] as const;

function stockLabel(quantity: number): string {
    if (quantity === 0) {
        return 'Out of stock';
    }

    if (quantity <= 5) {
        return 'Low stock';
    }

    return 'Healthy';
}

function stockBadgeVariant(
    quantity: number,
): 'outline' | 'secondary' | 'destructive' {
    if (quantity === 0) {
        return 'destructive';
    }

    return quantity <= 5 ? 'secondary' : 'outline';
}

function formatDateTime(value: string): string {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    }).format(new Date(value));
}

export default function AdminInventoryIndex() {
    const [listingUrl, setListingUrl] = useState(inventoryApiIndex.url());
    const [search, setSearch] = useState('');
    const [stockFilter, setStockFilter] = useState('all');
    const [selectedVariant, setSelectedVariant] =
        useState<ProductVariant | null>(null);
    const listing = useAdminApi<InventoryData>(listingUrl);
    const form = useHttp<MovementFormData>(emptyMovement);

    const applyFilters = (nextSearch: string, nextStatus: string) => {
        setListingUrl(
            inventoryApiIndex.url({
                query: {
                    search: nextSearch,
                    status: nextStatus,
                },
            }),
        );
    };

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        applyFilters(search.trim(), stockFilter);
    };

    const chooseFilter = (value: string) => {
        setStockFilter(value);
        applyFilters(search.trim(), value);
    };

    const openMovement = (variant: ProductVariant, type: MovementMode) => {
        setSelectedVariant(variant);
        form.clearErrors();
        form.setData({
            product_variant_id: variant.id,
            type,
            quantity: 1,
            unit_amount_cents:
                type === 'sold'
                    ? (variant.price_cents ?? variant.product.price_cents)
                    : null,
            reference: '',
            note: '',
        });
    };

    const closeMovement = () => {
        setSelectedVariant(null);
        form.reset();
        form.clearErrors();
    };

    const submitMovement = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        void form.post(storeInventoryMovement.url(), {
            onSuccess: () => {
                toast.success(
                    form.data.type === 'received'
                        ? 'Stock received'
                        : 'Sale recorded',
                );
                closeMovement();
                void listing.reload();
            },
        });
    };

    if (!listing.data) {
        return (
            <>
                <Head title="Inventory" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { metrics, variants, movements } = listing.data;
    const movementTitle =
        form.data.type === 'received' ? 'Receive stock' : 'Record sale';
    const projectedBalance = selectedVariant
        ? selectedVariant.stock_quantity +
          (form.data.type === 'received'
              ? form.data.quantity
              : -form.data.quantity)
        : 0;

    return (
        <>
            <Head title="Inventory" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Stock management
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Receive deliveries, record counter sales, and
                            monitor every SKU.
                        </p>
                    </div>
                    <Button asChild variant="outline">
                        <Link href={productsIndex()}>
                            <PackagePlus />
                            Add catalog product
                        </Link>
                    </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>Total units</CardDescription>
                            <Boxes className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-4 text-2xl font-semibold tabular-nums">
                            {metrics.unit_count.toLocaleString()}
                        </CardContent>
                    </Card>
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>Tracked SKUs</CardDescription>
                            <Search className="size-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="px-4 text-2xl font-semibold tabular-nums">
                            {metrics.sku_count.toLocaleString()}
                        </CardContent>
                    </Card>
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>Needs attention</CardDescription>
                            <TriangleAlert className="size-4 text-amber-600" />
                        </CardHeader>
                        <CardContent className="flex items-baseline gap-2 px-4">
                            <span className="text-2xl font-semibold tabular-nums">
                                {metrics.low_stock_count +
                                    metrics.out_of_stock_count}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {metrics.out_of_stock_count} out
                            </span>
                        </CardContent>
                    </Card>
                    <Card className="gap-3 rounded-lg py-4 shadow-none">
                        <CardHeader className="flex-row items-center justify-between px-4">
                            <CardDescription>
                                Counter sales today
                            </CardDescription>
                            <CircleDollarSign className="size-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent className="flex items-baseline gap-2 px-4">
                            <span className="text-2xl font-semibold tabular-nums">
                                {metrics.sales_today}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                {formatMoney(metrics.revenue_today_cents)}
                            </span>
                        </CardContent>
                    </Card>
                </div>

                <Card className="rounded-lg">
                    <CardHeader className="gap-4">
                        <div>
                            <CardTitle>Stock by variant</CardTitle>
                            <CardDescription>
                                {variants.total.toLocaleString()} color and size
                                combinations
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <form
                                className="flex w-full max-w-md gap-2"
                                onSubmit={submitSearch}
                            >
                                <div className="relative flex-1">
                                    <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        className="pl-9"
                                        placeholder="Search product, SKU, or color"
                                    />
                                </div>
                                <Button
                                    type="submit"
                                    variant="outline"
                                    size="icon"
                                >
                                    <Search />
                                    <span className="sr-only">
                                        Search inventory
                                    </span>
                                </Button>
                            </form>
                            <div className="flex flex-wrap gap-1 rounded-md border bg-muted/30 p-1">
                                {stockFilters.map((filter) => (
                                    <Button
                                        key={filter.value}
                                        type="button"
                                        size="sm"
                                        variant={
                                            stockFilter === filter.value
                                                ? 'secondary'
                                                : 'ghost'
                                        }
                                        onClick={() =>
                                            chooseFilter(filter.value)
                                        }
                                    >
                                        {filter.label}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[940px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="py-3 font-medium">
                                            Product
                                        </th>
                                        <th className="py-3 font-medium">
                                            Variant
                                        </th>
                                        <th className="py-3 font-medium">
                                            SKU
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Available
                                        </th>
                                        <th className="py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {variants.data.map((variant) => {
                                        const imageUrl =
                                            variant.image_url ??
                                            variant.product.primary_image_url;
                                        const available = Math.max(
                                            variant.stock_quantity -
                                                variant.reserved_quantity,
                                            0,
                                        );

                                        return (
                                            <tr
                                                key={variant.id}
                                                className="border-b last:border-0"
                                            >
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md border bg-muted">
                                                            {imageUrl ? (
                                                                <img
                                                                    src={
                                                                        imageUrl
                                                                    }
                                                                    alt=""
                                                                    className="size-full object-cover"
                                                                />
                                                            ) : (
                                                                <Boxes className="size-4 text-muted-foreground" />
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="max-w-56 truncate font-medium">
                                                                {
                                                                    variant
                                                                        .product
                                                                        .name
                                                                }
                                                            </div>
                                                            {!variant.product
                                                                .is_active && (
                                                                <span className="text-xs text-muted-foreground">
                                                                    Product
                                                                    inactive
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4">
                                                    <div className="flex items-center gap-2">
                                                        {variant.color_hex && (
                                                            <span
                                                                className="size-3 rounded-full border"
                                                                style={{
                                                                    backgroundColor:
                                                                        variant.color_hex,
                                                                }}
                                                            />
                                                        )}
                                                        {variant.color_name} /{' '}
                                                        {variant.size}
                                                    </div>
                                                </td>
                                                <td className="py-3 pr-4 font-mono text-xs">
                                                    {variant.sku}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="font-semibold tabular-nums">
                                                        {available.toLocaleString()}
                                                    </div>
                                                    {variant.reserved_quantity >
                                                        0 && (
                                                        <div className="text-xs text-muted-foreground">
                                                            {
                                                                variant.reserved_quantity
                                                            }{' '}
                                                            reserved
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="py-3 pl-6">
                                                    <Badge
                                                        variant={stockBadgeVariant(
                                                            variant.stock_quantity,
                                                        )}
                                                    >
                                                        {stockLabel(
                                                            variant.stock_quantity,
                                                        )}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() =>
                                                                openMovement(
                                                                    variant,
                                                                    'received',
                                                                )
                                                            }
                                                        >
                                                            <ArrowDownToLine />
                                                            Receive
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="sm"
                                                            disabled={
                                                                available ===
                                                                    0 ||
                                                                !variant.is_active ||
                                                                !variant.product
                                                                    .is_active
                                                            }
                                                            onClick={() =>
                                                                openMovement(
                                                                    variant,
                                                                    'sold',
                                                                )
                                                            }
                                                        >
                                                            <ShoppingCart />
                                                            Sell
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {variants.data.length === 0 && (
                                        <tr>
                                            <td
                                                colSpan={6}
                                                className="py-12 text-center text-muted-foreground"
                                            >
                                                No inventory matches these
                                                filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <AdminPagination
                            pagination={variants}
                            pageParameter="variant_page"
                            onPageChange={setListingUrl}
                        />
                    </CardContent>
                </Card>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>Inventory activity</CardTitle>
                        <CardDescription>
                            Receipts and counter sales recorded by the team
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
                                                <Badge
                                                    variant={
                                                        movement.type === 'sold'
                                                            ? 'secondary'
                                                            : 'outline'
                                                    }
                                                >
                                                    {movement.type ===
                                                    'sold' ? (
                                                        <ArrowUpFromLine />
                                                    ) : (
                                                        <ArrowDownToLine />
                                                    )}
                                                    {movement.type === 'sold'
                                                        ? '-'
                                                        : '+'}
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
                                                No inventory activity yet.
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

            <Dialog
                open={selectedVariant !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        closeMovement();
                    }
                }}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{movementTitle}</DialogTitle>
                        <DialogDescription>
                            {selectedVariant?.product.name} /{' '}
                            {selectedVariant?.color_name} /{' '}
                            {selectedVariant?.size}
                        </DialogDescription>
                    </DialogHeader>

                    <form className="grid gap-4" onSubmit={submitMovement}>
                        <div className="grid grid-cols-3 gap-2 rounded-md border bg-muted/30 p-3 text-center">
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Current
                                </div>
                                <div className="font-semibold tabular-nums">
                                    {selectedVariant?.stock_quantity ?? 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    Change
                                </div>
                                <div className="font-semibold tabular-nums">
                                    {form.data.type === 'received' ? '+' : '-'}
                                    {form.data.quantity || 0}
                                </div>
                            </div>
                            <div>
                                <div className="text-xs text-muted-foreground">
                                    New balance
                                </div>
                                <div
                                    className={`font-semibold tabular-nums ${
                                        projectedBalance < 0
                                            ? 'text-destructive'
                                            : ''
                                    }`}
                                >
                                    {projectedBalance}
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="movement-quantity">Quantity</Label>
                            <Input
                                id="movement-quantity"
                                type="number"
                                min={1}
                                max={
                                    form.data.type === 'sold'
                                        ? Math.max(
                                              (selectedVariant?.stock_quantity ??
                                                  0) -
                                                  (selectedVariant?.reserved_quantity ??
                                                      0),
                                              0,
                                          )
                                        : 999999
                                }
                                value={form.data.quantity}
                                onChange={(event) =>
                                    form.setData(
                                        'quantity',
                                        Number(event.target.value),
                                    )
                                }
                                autoFocus
                            />
                            {form.errors.quantity && (
                                <p className="text-sm text-destructive">
                                    {form.errors.quantity}
                                </p>
                            )}
                        </div>

                        {form.data.type === 'sold' && (
                            <div className="grid gap-2">
                                <Label htmlFor="movement-price">
                                    Unit sale price
                                </Label>
                                <div className="relative">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        id="movement-price"
                                        className="pl-7"
                                        type="number"
                                        min={0}
                                        step="0.01"
                                        value={
                                            (form.data.unit_amount_cents ?? 0) /
                                            100
                                        }
                                        onChange={(event) =>
                                            form.setData(
                                                'unit_amount_cents',
                                                Math.round(
                                                    Number(event.target.value) *
                                                        100,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                {form.errors.unit_amount_cents && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.unit_amount_cents}
                                    </p>
                                )}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="movement-reference">
                                {form.data.type === 'received'
                                    ? 'Delivery reference'
                                    : 'Receipt reference'}
                            </Label>
                            <Input
                                id="movement-reference"
                                value={form.data.reference}
                                onChange={(event) =>
                                    form.setData(
                                        'reference',
                                        event.target.value,
                                    )
                                }
                                placeholder={
                                    form.data.type === 'received'
                                        ? 'PO-1042'
                                        : 'POS-2088'
                                }
                            />
                            {form.errors.reference && (
                                <p className="text-sm text-destructive">
                                    {form.errors.reference}
                                </p>
                            )}
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="movement-note">Note</Label>
                            <Textarea
                                id="movement-note"
                                value={form.data.note}
                                onChange={(event) =>
                                    form.setData('note', event.target.value)
                                }
                                placeholder="Optional details"
                                rows={3}
                            />
                            {form.errors.note && (
                                <p className="text-sm text-destructive">
                                    {form.errors.note}
                                </p>
                            )}
                        </div>

                        {form.errors.product_variant_id && (
                            <p className="text-sm text-destructive">
                                {form.errors.product_variant_id}
                            </p>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeMovement}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={
                                    form.processing || projectedBalance < 0
                                }
                            >
                                {form.data.type === 'received' ? (
                                    <ArrowDownToLine />
                                ) : (
                                    <ShoppingCart />
                                )}
                                {form.processing ? 'Saving...' : movementTitle}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminInventoryIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Inventory', href: inventoryIndex() },
    ],
};
