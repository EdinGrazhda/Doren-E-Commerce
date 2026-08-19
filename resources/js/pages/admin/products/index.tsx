import { Head, useHttp } from '@inertiajs/react';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

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
    gallery_image_urls: string[] | null;
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
    image_url: string | null;
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

type ProductColorFormData = {
    name: string;
    hex: string;
    imageUrl: string;
    imageUpload: File | null;
    stockBySize: Record<string, string>;
};

type ProductVariantFormData = {
    size: string;
    color_name: string;
    color_hex: string;
    image_url: string;
    color_image_upload_index: number;
    stock_quantity: string;
};

type ProductVariantFormField = keyof Pick<
    ProductVariantFormData,
    | 'color_name'
    | 'color_hex'
    | 'image_url'
    | 'color_image_upload_index'
    | 'stock_quantity'
>;

type ProductVariantFormErrorKey =
    `variants.${number}.${ProductVariantFormField}`;

type ProductFormData = {
    product_category_id: string;
    name: string;
    slug: string;
    sku: string;
    description: string;
    price: string;
    currency: string;
    existing_image_urls: string[];
    image_uploads: File[];
    color_image_uploads: Array<File | null>;
    is_active: boolean;
    is_featured: boolean;
    colors: ProductColorFormData[];
    variants: ProductVariantFormData[];
};

const makeEmptyColor = (
    sizeOptions: string[],
    colorNumber = 1,
): ProductColorFormData => ({
    name: colorNumber === 1 ? 'Olive' : `Color ${colorNumber}`,
    hex: colorNumber === 1 ? '#4b4a35' : '#000000',
    imageUrl: '',
    imageUpload: null,
    stockBySize: Object.fromEntries(sizeOptions.map((size) => [size, '0'])),
});

const makeEmptyProduct = (sizeOptions: string[]): ProductFormData => ({
    product_category_id: '0',
    name: '',
    slug: '',
    sku: '',
    description: '',
    price: '0.00',
    currency: 'USD',
    existing_image_urls: [],
    image_uploads: [],
    color_image_uploads: [],
    is_active: true,
    is_featured: false,
    colors: [makeEmptyColor(sizeOptions)],
    variants: [],
});

const colorsFromVariants = (
    variants: ProductVariant[],
    sizeOptions: string[],
): ProductColorFormData[] => {
    const colors = new Map<string, ProductColorFormData>();

    variants.forEach((variant) => {
        const key = variant.color_name.toLocaleLowerCase();
        const color = colors.get(key) ?? {
            name: variant.color_name,
            hex: variant.color_hex ?? '',
            imageUrl: variant.image_url ?? '',
            imageUpload: null,
            stockBySize: Object.fromEntries(
                sizeOptions.map((size) => [size, '0']),
            ),
        };

        color.stockBySize[variant.size] = variant.stock_quantity.toString();
        colors.set(key, color);
    });

    return colors.size > 0
        ? Array.from(colors.values())
        : [makeEmptyColor(sizeOptions)];
};

const centsToPrice = (cents: number): string => (cents / 100).toFixed(2);

const toIndexedRecord = <Value,>(values: Value[]): Record<string, Value> =>
    Object.fromEntries(values.map((value, index) => [index.toString(), value]));

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
        form.setData({
            product_category_id: product.category?.id.toString() ?? '0',
            name: product.name,
            slug: product.slug,
            sku: product.sku ?? '',
            description: product.description ?? '',
            price: centsToPrice(product.price_cents),
            currency: product.currency,
            existing_image_urls: [
                product.primary_image_url,
                ...(product.gallery_image_urls ?? []),
            ].filter((imageUrl): imageUrl is string => Boolean(imageUrl)),
            image_uploads: [],
            color_image_uploads: [],
            is_active: product.is_active,
            is_featured: product.is_featured,
            colors: colorsFromVariants(product.variants, sizeOptions),
            variants: [],
        });
        setOpen(true);
    };

    const productSubmitData = (data: ProductFormData) => ({
        product_category_id: data.product_category_id,
        name: data.name,
        slug: data.slug,
        sku: data.sku,
        description: data.description,
        price: data.price,
        currency: data.currency,
        existing_image_urls: data.existing_image_urls,
        image_uploads: data.image_uploads,
        is_active: data.is_active,
        is_featured: data.is_featured,
    });

    const colorImageUploads = (
        colors: ProductColorFormData[],
    ): Array<File | null> => colors.map((color) => color.imageUpload);

    const colorVariants = (
        colors: ProductColorFormData[],
    ): ProductVariantFormData[] =>
        colors.flatMap((color, colorIndex) =>
            sizeOptions.map((size) => ({
                size,
                color_name: color.name,
                color_hex: color.hex,
                image_url: color.imageUrl,
                color_image_upload_index: colorIndex,
                stock_quantity: color.stockBySize[size] ?? '0',
            })),
        );

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
                ...productSubmitData(data),
                color_image_uploads: toIndexedRecord(
                    colorImageUploads(data.colors),
                ),
                variants: toIndexedRecord(colorVariants(data.colors)),
                _method: 'put',
            }));
            void form.post(updateProduct.url(editingProduct.id), options);

            return;
        }

        form.transform((data) => ({
            ...productSubmitData(data),
            color_image_uploads: toIndexedRecord(
                colorImageUploads(data.colors),
            ),
            variants: toIndexedRecord(colorVariants(data.colors)),
        }));
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

    const variantErrorKey = (
        colorIndex: number,
        sizeIndex: number,
        field: ProductVariantFormField,
    ): ProductVariantFormErrorKey =>
        `variants.${colorIndex * sizeOptions.length + sizeIndex}.${field}`;

    const clearColorVariantErrors = (
        colorIndex: number,
        fields: Array<'color_name' | 'color_hex' | 'image_url'>,
    ) => {
        form.clearErrors(
            ...sizeOptions.flatMap((_, sizeIndex) =>
                fields.map((field) =>
                    variantErrorKey(colorIndex, sizeIndex, field),
                ),
            ),
            'variants',
        );
    };

    const updateColor = (
        index: number,
        field: 'name' | 'hex' | 'imageUrl',
        value: string,
    ) => {
        clearColorVariantErrors(index, [
            field === 'name'
                ? 'color_name'
                : field === 'hex'
                  ? 'color_hex'
                  : 'image_url',
        ]);

        form.setData(
            'colors',
            form.data.colors.map((color, colorIndex) =>
                colorIndex === index ? { ...color, [field]: value } : color,
            ),
        );
    };

    const updateColorImageUpload = (index: number, file: File | null) => {
        form.clearErrors(`color_image_uploads.${index}`);
        clearColorVariantErrors(index, ['image_url']);

        form.setData(
            'colors',
            form.data.colors.map((color, colorIndex) =>
                colorIndex === index
                    ? {
                          ...color,
                          imageUpload: file,
                      }
                    : color,
            ),
        );
    };

    const updateColorStock = (
        colorIndex: number,
        size: string,
        value: string,
    ) => {
        const sizeIndex = sizeOptions.indexOf(size);

        if (sizeIndex >= 0) {
            form.clearErrors(
                variantErrorKey(colorIndex, sizeIndex, 'stock_quantity'),
                'variants',
            );
        }

        form.setData(
            'colors',
            form.data.colors.map((color, index) =>
                index === colorIndex
                    ? {
                          ...color,
                          stockBySize: {
                              ...color.stockBySize,
                              [size]: value,
                          },
                      }
                    : color,
            ),
        );
    };

    const addColor = () => {
        form.setData('colors', [
            ...form.data.colors,
            makeEmptyColor(sizeOptions, form.data.colors.length + 1),
        ]);
    };

    const removeColor = (colorIndex: number) => {
        if (form.data.colors.length === 1) {
            return;
        }

        form.setData(
            'colors',
            form.data.colors.filter((_, index) => index !== colorIndex),
        );
    };

    const variantError = (
        colorIndex: number,
        sizeIndex: number,
        field:
            | 'color_name'
            | 'color_hex'
            | 'image_url'
            | 'color_image_upload_index'
            | 'stock_quantity',
    ): string | undefined =>
        formErrors[variantErrorKey(colorIndex, sizeIndex, field)];

    const colorImageUploadError = (colorIndex: number): string | undefined =>
        formErrors[`color_image_uploads.${colorIndex}`];

    const productError = formErrors.product;
    const validationErrorMessages = Array.from(
        new Set(Object.values(formErrors)),
    ).slice(0, 4);

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
                            <DialogContent className="sm:max-w-3xl">
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
                                    {validationErrorMessages.length > 0 && (
                                        <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                            <p className="font-medium">
                                                Please fix these fields.
                                            </p>
                                            <ul className="mt-2 list-disc space-y-1 pl-5">
                                                {validationErrorMessages.map(
                                                    (message) => (
                                                        <li key={message}>
                                                            {message}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        </div>
                                    )}

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

                                    <div className="grid gap-3">
                                        <Label htmlFor="product-images-upload">
                                            Product images
                                        </Label>
                                        <Input
                                            id="product-images-upload"
                                            type="file"
                                            accept="image/jpeg,image/png,image/webp"
                                            multiple
                                            onChange={(event) =>
                                                form.setData(
                                                    'image_uploads',
                                                    Array.from(
                                                        event.target.files ??
                                                            [],
                                                    ).slice(0, 4),
                                                )
                                            }
                                        />
                                        <p className="text-xs text-muted-foreground">
                                            Upload up to 4 product images. The
                                            first image is used as the main
                                            product image.
                                        </p>
                                        {form.data.existing_image_urls.length >
                                            0 &&
                                            form.data.image_uploads.length ===
                                                0 && (
                                                <div className="grid grid-cols-4 gap-2">
                                                    {form.data.existing_image_urls
                                                        .slice(0, 4)
                                                        .map(
                                                            (
                                                                imageUrl,
                                                                imageIndex,
                                                            ) => (
                                                                <div
                                                                    key={`${imageUrl}-${imageIndex}`}
                                                                    className="aspect-[0.82] overflow-hidden rounded-md bg-muted"
                                                                >
                                                                    <img
                                                                        src={
                                                                            imageUrl
                                                                        }
                                                                        alt=""
                                                                        className="h-full w-full object-cover"
                                                                    />
                                                                </div>
                                                            ),
                                                        )}
                                                </div>
                                            )}
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
                                        {(formErrors.image_uploads ||
                                            formErrors['image_uploads.0'] ||
                                            formErrors['image_uploads.1'] ||
                                            formErrors['image_uploads.2'] ||
                                            formErrors['image_uploads.3']) && (
                                            <p className="text-sm text-destructive">
                                                {formErrors.image_uploads ??
                                                    formErrors[
                                                        'image_uploads.0'
                                                    ] ??
                                                    formErrors[
                                                        'image_uploads.1'
                                                    ] ??
                                                    formErrors[
                                                        'image_uploads.2'
                                                    ] ??
                                                    formErrors[
                                                        'image_uploads.3'
                                                    ]}
                                            </p>
                                        )}
                                    </div>

                                    <div className="grid gap-3">
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <Label>
                                                    Colors and inventory
                                                </Label>
                                                <p className="text-xs text-muted-foreground">
                                                    Add each product color once,
                                                    then enter its stock for
                                                    every size.
                                                </p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={addColor}
                                            >
                                                <Plus />
                                                Add color
                                            </Button>
                                        </div>

                                        {form.data.colors.map(
                                            (color, colorIndex) => (
                                                <fieldset
                                                    key={colorIndex}
                                                    className="grid gap-4 rounded-md border p-4"
                                                >
                                                    <legend className="sr-only">
                                                        Color {colorIndex + 1}
                                                    </legend>
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <span
                                                                className="size-5 rounded-full border shadow-xs"
                                                                style={{
                                                                    backgroundColor:
                                                                        color.hex ||
                                                                        '#000000',
                                                                }}
                                                            />
                                                            <span className="text-sm font-semibold">
                                                                Color{' '}
                                                                {colorIndex + 1}
                                                            </span>
                                                        </div>
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon"
                                                            disabled={
                                                                form.data.colors
                                                                    .length ===
                                                                1
                                                            }
                                                            onClick={() =>
                                                                removeColor(
                                                                    colorIndex,
                                                                )
                                                            }
                                                            aria-label={`Remove color ${colorIndex + 1}`}
                                                            title="Remove color"
                                                        >
                                                            <Trash2 />
                                                        </Button>
                                                    </div>

                                                    <div className="grid gap-4 sm:grid-cols-2">
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`product-color-${colorIndex}-name`}
                                                            >
                                                                Color name
                                                            </Label>
                                                            <Input
                                                                id={`product-color-${colorIndex}-name`}
                                                                value={
                                                                    color.name
                                                                }
                                                                onChange={(
                                                                    event,
                                                                ) =>
                                                                    updateColor(
                                                                        colorIndex,
                                                                        'name',
                                                                        event
                                                                            .target
                                                                            .value,
                                                                    )
                                                                }
                                                                placeholder="Olive"
                                                            />
                                                            {variantError(
                                                                colorIndex,
                                                                0,
                                                                'color_name',
                                                            ) && (
                                                                <p className="text-sm text-destructive">
                                                                    {variantError(
                                                                        colorIndex,
                                                                        0,
                                                                        'color_name',
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="grid gap-2">
                                                            <Label
                                                                htmlFor={`product-color-${colorIndex}-hex`}
                                                            >
                                                                Swatch color
                                                            </Label>
                                                            <div className="grid grid-cols-[44px_1fr] gap-2">
                                                                <Input
                                                                    aria-label={`Choose color ${colorIndex + 1}`}
                                                                    type="color"
                                                                    className="p-1"
                                                                    value={
                                                                        color.hex ||
                                                                        '#000000'
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateColor(
                                                                            colorIndex,
                                                                            'hex',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                />
                                                                <Input
                                                                    id={`product-color-${colorIndex}-hex`}
                                                                    value={
                                                                        color.hex
                                                                    }
                                                                    onChange={(
                                                                        event,
                                                                    ) =>
                                                                        updateColor(
                                                                            colorIndex,
                                                                            'hex',
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                    }
                                                                    placeholder="#4b4a35"
                                                                />
                                                            </div>
                                                            {variantError(
                                                                colorIndex,
                                                                0,
                                                                'color_hex',
                                                            ) && (
                                                                <p className="text-sm text-destructive">
                                                                    {variantError(
                                                                        colorIndex,
                                                                        0,
                                                                        'color_hex',
                                                                    )}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <Label
                                                            htmlFor={`product-color-${colorIndex}-image-upload`}
                                                        >
                                                            Color product image
                                                        </Label>
                                                        <Input
                                                            id={`product-color-${colorIndex}-image-upload`}
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            onChange={(event) =>
                                                                updateColorImageUpload(
                                                                    colorIndex,
                                                                    event.target
                                                                        .files?.[0] ??
                                                                        null,
                                                                )
                                                            }
                                                        />
                                                        {color.imageUrl &&
                                                            !color.imageUpload && (
                                                                <div className="flex items-center gap-3 rounded-md border bg-muted/30 p-2">
                                                                    <div className="h-14 w-12 overflow-hidden rounded bg-muted">
                                                                        <img
                                                                            src={
                                                                                color.imageUrl
                                                                            }
                                                                            alt=""
                                                                            className="h-full w-full object-cover"
                                                                        />
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground">
                                                                        Current
                                                                        color
                                                                        image
                                                                    </p>
                                                                </div>
                                                            )}
                                                        {color.imageUpload && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Selected:{' '}
                                                                {
                                                                    color
                                                                        .imageUpload
                                                                        .name
                                                                }
                                                            </p>
                                                        )}
                                                        {colorImageUploadError(
                                                            colorIndex,
                                                        ) && (
                                                            <p className="text-sm text-destructive">
                                                                {colorImageUploadError(
                                                                    colorIndex,
                                                                )}
                                                            </p>
                                                        )}
                                                        {variantError(
                                                            colorIndex,
                                                            0,
                                                            'image_url',
                                                        ) && (
                                                            <p className="text-sm text-destructive">
                                                                {variantError(
                                                                    colorIndex,
                                                                    0,
                                                                    'image_url',
                                                                )}
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="grid gap-2">
                                                        <div className="grid grid-cols-[72px_1fr] gap-3 px-1 text-xs font-medium text-muted-foreground">
                                                            <span>Size</span>
                                                            <span>Stock</span>
                                                        </div>
                                                        {sizeOptions.map(
                                                            (
                                                                size,
                                                                sizeIndex,
                                                            ) => (
                                                                <div
                                                                    key={size}
                                                                    className="grid grid-cols-[72px_1fr] items-start gap-3"
                                                                >
                                                                    <div className="flex h-9 items-center px-1 text-sm font-medium">
                                                                        {size}
                                                                    </div>
                                                                    <div className="grid gap-1">
                                                                        <Input
                                                                            aria-label={`${color.name || `Color ${colorIndex + 1}`} ${size} stock`}
                                                                            type="number"
                                                                            min="0"
                                                                            value={
                                                                                color
                                                                                    .stockBySize[
                                                                                    size
                                                                                ] ??
                                                                                '0'
                                                                            }
                                                                            onChange={(
                                                                                event,
                                                                            ) =>
                                                                                updateColorStock(
                                                                                    colorIndex,
                                                                                    size,
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                )
                                                                            }
                                                                        />
                                                                        {variantError(
                                                                            colorIndex,
                                                                            sizeIndex,
                                                                            'stock_quantity',
                                                                        ) && (
                                                                            <p className="text-sm text-destructive">
                                                                                {variantError(
                                                                                    colorIndex,
                                                                                    sizeIndex,
                                                                                    'stock_quantity',
                                                                                )}
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            ),
                                                        )}
                                                    </div>
                                                </fieldset>
                                            ),
                                        )}

                                        {formErrors.variants && (
                                            <p className="text-sm text-destructive">
                                                {formErrors.variants}
                                            </p>
                                        )}
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
