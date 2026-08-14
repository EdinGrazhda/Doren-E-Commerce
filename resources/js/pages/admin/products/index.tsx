import { Head, useHttp } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import {  useState } from 'react';
import type {FormEvent} from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
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
import { formatDate, formatMoney } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import {
    destroy as destroyProduct,
    index as productsApiIndex,
    store as storeProduct,
    update as updateProduct,
} from '@/routes/api/admin/products';
import { index as productsIndex } from '@/routes/dashboard/products';

type Product = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    price_cents: number;
    currency: string;
    is_active: boolean;
    is_featured: boolean;
    primary_image_url: string | null;
    updated_at: string;
    variants_count: number;
    category: { id: number; name: string } | null;
    variants: ProductVariant[];
};

type ProductVariant = {
    id: number;
    size: string;
    color_name: string;
    color_hex: string | null;
    stock_quantity: number;
    is_active: boolean;
};

type CategoryOption = {
    id: number;
    name: string;
};

type Paginated<T> = {
    data: T[];
    total: number;
};

type Props = {
    products: Paginated<Product>;
    categories: CategoryOption[];
    sizeOptions: string[];
};

type ProductVariantFormData = {
    size: string;
    color_name: string;
    color_hex: string;
    stock_quantity: string;
};

type ProductFormData = {
    product_category_id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: string;
    currency: string;
    primary_image_url: string;
    primary_image_upload: File | null;
    is_active: boolean;
    is_featured: boolean;
    variants: ProductVariantFormData[];
};

const makeEmptyProduct = (sizeOptions: string[]): ProductFormData => ({
    product_category_id: '0',
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '0.00',
    currency: 'USD',
    primary_image_url: '',
    primary_image_upload: null,
    is_active: true,
    is_featured: false,
    variants: sizeOptions.map((size) => ({
        size,
        color_name: 'Olive',
        color_hex: '#4b4a35',
        stock_quantity: '0',
    })),
});

const centsToPrice = (cents: number): string => (cents / 100).toFixed(2);

export default function AdminProductsIndex() {
    const [open, setOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const listing = useAdminApi<Props>(productsApiIndex.url());
    const sizeOptions = listing.data?.sizeOptions ?? [
        'S',
        'M',
        'L',
        'XL',
        'XXL',
    ];
    const form = useHttp<ProductFormData>(makeEmptyProduct(sizeOptions));
    const deleteRequest = useHttp<Record<string, never>>({});
    const formErrors = form.errors as Record<string, string>;

    if (!listing.data) {
        return (
            <>
                <Head title="Admin Products" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { products, categories } = listing.data;

    const openCreateDialog = () => {
        setEditingProduct(null);
        form.clearErrors();
        form.setData(makeEmptyProduct(sizeOptions));
        setOpen(true);
    };

    const openEditDialog = (product: Product) => {
        setEditingProduct(product);
        form.clearErrors();
        const variantsBySize = new Map(
            product.variants.map((variant) => [variant.size, variant]),
        );
        const fallbackVariant = product.variants[0];

        form.setData({
            product_category_id: product.category?.id.toString() ?? '0',
            name: product.name,
            slug: product.slug,
            sku: product.sku ?? '',
            description: product.description ?? '',
            price: centsToPrice(product.price_cents),
            currency: product.currency,
            primary_image_url: product.primary_image_url ?? '',
            primary_image_upload: null,
            is_active: product.is_active,
            is_featured: product.is_featured,
            variants: sizeOptions.map((size) => {
                const variant = variantsBySize.get(size);

                return {
                    size,
                    color_name:
                        variant?.color_name ??
                        fallbackVariant?.color_name ??
                        'Olive',
                    color_hex:
                        variant?.color_hex ?? fallbackVariant?.color_hex ?? '',
                    stock_quantity: variant?.stock_quantity.toString() ?? '0',
                };
            }),
        });
        setOpen(true);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                setOpen(false);
                setEditingProduct(null);
                form.reset();
                void listing.reload();
            },
        };

        if (editingProduct) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));
            void form.post(updateProduct.url(editingProduct.id), options);

            return;
        }

        form.transform((data) => data);
        void form.post(storeProduct.url(), options);
    };

    const deleteProduct = (product: Product) => {
        if (!window.confirm(`Delete ${product.name}?`)) {
            return;
        }

        void deleteRequest
            .delete(destroyProduct.url(product.id), {
                onSuccess: () => void listing.reload(),
                onError: (errors) => form.setError(errors),
            })
            .catch(() => undefined);
    };

    const updateVariant = (
        index: number,
        field: keyof ProductVariantFormData,
        value: string,
    ) => {
        form.setData(
            'variants',
            form.data.variants.map((variant, variantIndex) =>
                variantIndex === index
                    ? { ...variant, [field]: value }
                    : variant,
            ),
        );
    };

    const productError = formErrors.product;

    return (
        <>
            <Head title="Admin Products" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Products
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Catalog items, pricing, variants, and storefront
                            visibility.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Input
                            className="max-w-xs"
                            placeholder="Search products"
                        />
                        <Dialog open={open} onOpenChange={setOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateDialog}>
                                    <Plus />
                                    New product
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>
                                        {editingProduct
                                            ? 'Edit product'
                                            : 'New product'}
                                    </DialogTitle>
                                    <DialogDescription>
                                        Manage catalog details and storefront
                                        availability.
                                    </DialogDescription>
                                </DialogHeader>

                                <form
                                    className="grid max-h-[72vh] gap-4 overflow-y-auto pr-1"
                                    onSubmit={submit}
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label htmlFor="product-name">
                                                Name
                                            </Label>
                                            <Input
                                                id="product-name"
                                                value={form.data.name}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'name',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="product-slug">
                                                Slug
                                            </Label>
                                            <Input
                                                id="product-slug"
                                                value={form.data.slug}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'slug',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="auto-generated from name"
                                            />
                                            {form.errors.slug && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.slug}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="grid gap-2">
                                            <Label>Category</Label>
                                            <Select
                                                value={
                                                    form.data
                                                        .product_category_id
                                                }
                                                onValueChange={(value) =>
                                                    form.setData(
                                                        'product_category_id',
                                                        value,
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-full">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="0">
                                                        Uncategorized
                                                    </SelectItem>
                                                    {categories.map(
                                                        (category) => (
                                                            <SelectItem
                                                                key={
                                                                    category.id
                                                                }
                                                                value={category.id.toString()}
                                                            >
                                                                {category.name}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="product-sku">
                                                SKU
                                            </Label>
                                            <Input
                                                id="product-sku"
                                                value={form.data.sku}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'sku',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.sku && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.sku}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="product-description">
                                            Description
                                        </Label>
                                        <textarea
                                            id="product-description"
                                            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:aria-invalid:ring-destructive/40"
                                            value={form.data.description}
                                            onChange={(event) =>
                                                form.setData(
                                                    'description',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                    </div>

                                    <div className="grid gap-4 sm:grid-cols-3">
                                        <div className="grid gap-2">
                                            <Label htmlFor="product-price">
                                                Price
                                            </Label>
                                            <Input
                                                id="product-price"
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={form.data.price}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'price',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors.price && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.price}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="product-currency">
                                                Currency
                                            </Label>
                                            <Input
                                                id="product-currency"
                                                maxLength={3}
                                                value={form.data.currency}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'currency',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="product-image">
                                            Primary image URL
                                        </Label>
                                        <Input
                                            id="product-image"
                                            value={form.data.primary_image_url}
                                            onChange={(event) =>
                                                form.setData(
                                                    'primary_image_url',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        {form.errors.primary_image_url && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.primary_image_url}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="product-image-upload">
                                            Upload primary image
                                        </Label>
                                        <Input
                                            id="product-image-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            onChange={(event) =>
                                                form.setData(
                                                    'primary_image_upload',
                                                    event.target.files?.[0] ??
                                                        null,
                                                )
                                            }
                                        />
                                        {form.progress && (
                                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{
                                                        width: `${form.progress.percentage}%`,
                                                    }}
                                                />
                                            </div>
                                        )}
                                        {formErrors.primary_image_upload && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    formErrors.primary_image_upload
                                                }
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-3">
                                        <div>
                                            <Label>Size inventory</Label>
                                            <p className="text-xs text-muted-foreground">
                                                Set stock and color for S, M, L,
                                                XL, and XXL.
                                            </p>
                                        </div>
                                        <div className="grid gap-3 rounded-lg border p-3">
                                            {form.data.variants.map(
                                                (variant, index) => (
                                                    <div
                                                        key={variant.size}
                                                        className="grid gap-3 sm:grid-cols-[64px_1fr_112px_120px]"
                                                    >
                                                        <div className="flex h-9 items-center text-sm font-medium">
                                                            {variant.size}
                                                        </div>
                                                        <Input
                                                            value={
                                                                variant.color_name
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    index,
                                                                    'color_name',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Color name"
                                                        />
                                                        <div className="flex gap-2">
                                                            <Input
                                                                type="color"
                                                                className="w-12 p-1"
                                                                value={
                                                                    variant.color_hex ||
                                                                    '#4b4a35'
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateVariant(
                                                                        index,
                                                                        'color_hex',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                            />
                                                            <Input
                                                                value={
                                                                    variant.color_hex
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateVariant(
                                                                        index,
                                                                        'color_hex',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="#4b4a35"
                                                            />
                                                        </div>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            value={
                                                                variant.stock_quantity
                                                            }
                                                            onChange={(event) =>
                                                                updateVariant(
                                                                    index,
                                                                    'stock_quantity',
                                                                    event.target
                                                                        .value,
                                                                )
                                                            }
                                                            placeholder="Qty"
                                                        />
                                                        {(formErrors[
                                                            `variants.${index}.color_name`
                                                        ] ||
                                                            formErrors[
                                                                `variants.${index}.color_hex`
                                                            ] ||
                                                            formErrors[
                                                                `variants.${index}.stock_quantity`
                                                            ]) && (
                                                            <p className="text-sm text-destructive sm:col-span-4">
                                                                {formErrors[
                                                                    `variants.${index}.color_name`
                                                                ] ||
                                                                    formErrors[
                                                                        `variants.${index}.color_hex`
                                                                    ] ||
                                                                    formErrors[
                                                                        `variants.${index}.stock_quantity`
                                                                    ]}
                                                            </p>
                                                        )}
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-4">
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Checkbox
                                                checked={form.data.is_active}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'is_active',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            Active
                                        </label>
                                        <label className="flex items-center gap-2 text-sm font-medium">
                                            <Checkbox
                                                checked={form.data.is_featured}
                                                onCheckedChange={(checked) =>
                                                    form.setData(
                                                        'is_featured',
                                                        checked === true,
                                                    )
                                                }
                                            />
                                            Featured
                                        </label>
                                    </div>

                                    {productError && (
                                        <p className="text-sm text-destructive">
                                            {productError}
                                        </p>
                                    )}

                                    <DialogFooter className="sticky bottom-0 bg-background pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setOpen(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={form.processing}
                                        >
                                            {editingProduct ? 'Save' : 'Create'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            {products.total.toLocaleString()} products
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[860px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-muted-foreground">
                                    <th className="py-3 font-medium">
                                        Product
                                    </th>
                                    <th className="py-3 font-medium">
                                        Category
                                    </th>
                                    <th className="py-3 font-medium">SKU</th>
                                    <th className="py-3 font-medium">
                                        Variants
                                    </th>
                                    <th className="py-3 font-medium">Stock</th>
                                    <th className="py-3 font-medium">Colors</th>
                                    <th className="py-3 font-medium">Status</th>
                                    <th className="py-3 font-medium">
                                        Updated
                                    </th>
                                    <th className="py-3 text-right font-medium">
                                        Price
                                    </th>
                                    <th className="py-3 text-right font-medium">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.data.map((product) => (
                                    <tr
                                        key={product.id}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-10 overflow-hidden rounded-md bg-muted">
                                                    {product.primary_image_url && (
                                                        <img
                                                            src={
                                                                product.primary_image_url
                                                            }
                                                            alt={product.name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    )}
                                                </div>
                                                <div>
                                                    <div className="font-medium">
                                                        {product.name}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">
                                                        /{product.slug}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {product.category?.name ??
                                                'Uncategorized'}
                                        </td>
                                        <td className="py-3">
                                            {product.sku ?? 'Not set'}
                                        </td>
                                        <td className="py-3">
                                            {product.variants_count}
                                        </td>
                                        <td className="py-3">
                                            {product.variants
                                                .reduce(
                                                    (total, variant) =>
                                                        total +
                                                        Number(
                                                            variant.stock_quantity,
                                                        ),
                                                    0,
                                                )
                                                .toLocaleString()}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex flex-wrap gap-2">
                                                {Array.from(
                                                    new Map(
                                                        product.variants.map(
                                                            (variant) => [
                                                                `${variant.color_name}-${variant.color_hex}`,
                                                                variant,
                                                            ],
                                                        ),
                                                    ).values(),
                                                ).map((variant) => (
                                                    <span
                                                        key={`${variant.color_name}-${variant.color_hex}`}
                                                        className="inline-flex items-center gap-1.5 text-xs"
                                                    >
                                                        <span
                                                            className="size-3 rounded-full border"
                                                            style={{
                                                                backgroundColor:
                                                                    variant.color_hex ??
                                                                    'transparent',
                                                            }}
                                                        />
                                                        {variant.color_name}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            <div className="flex gap-2">
                                                <Badge
                                                    variant={
                                                        product.is_active
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {product.is_active
                                                        ? 'Active'
                                                        : 'Draft'}
                                                </Badge>
                                                {product.is_featured && (
                                                    <Badge variant="outline">
                                                        Featured
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-3">
                                            {formatDate(product.updated_at)}
                                        </td>
                                        <td className="py-3 text-right font-medium">
                                            {formatMoney(
                                                product.price_cents,
                                                product.currency,
                                            )}
                                        </td>
                                        <td className="py-3">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() =>
                                                        openEditDialog(product)
                                                    }
                                                >
                                                    <Edit />
                                                    Edit
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={() =>
                                                        deleteProduct(product)
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
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Products',
            href: productsIndex(),
        },
    ],
};
