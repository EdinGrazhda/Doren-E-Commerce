import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Heart,
    Instagram,
    LockKeyhole,
    Mail,
    PackageCheck,
    Ruler,
    Search,
    ShieldCheck,
    ShoppingBag,
    Truck,
    User,
    Youtube,
    ZoomIn,
} from 'lucide-react';

import { cart as cartRoute, home, login } from '@/routes';
import { store as storeCartItem } from '@/routes/cart-items';
import { show as showProduct } from '@/routes/products';

type ProductColor = {
    name: string;
    hex: string;
};

type Product = {
    id: number;
    name: string;
    slug: string;
    sku: string | null;
    description: string | null;
    price_cents: number;
    compare_at_price_cents: number | null;
    currency: string;
    image_url: string | null;
    images: string[];
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    colors: ProductColor[];
    sizes: string[];
    variants: ProductVariantOption[];
};

type ProductVariantOption = {
    id: number;
    size: string;
    color_name: string;
    color_hex: string | null;
    stock_quantity: number;
    price_cents: number | null;
};

type RelatedProduct = {
    id: number;
    name: string;
    slug: string;
    price_cents: number;
    currency: string;
    image_url: string | null;
    is_featured: boolean;
    colors: ProductColor[];
};

type Props = {
    product: Product;
    relatedProducts: RelatedProduct[];
};

const navigationItems = [
    'New In',
    'Polos',
    'Knitwear',
    'Shirts',
    'Trousers',
    'Jackets',
    'Sale',
];

const fallbackImages = [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=1200&q=85',
    'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?auto=format&fit=crop&w=1200&q=85',
];

function imageFor(value: string | null | undefined, index: number): string {
    return value || fallbackImages[index % fallbackImages.length];
}

function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(cents / 100);
}

function sectionId(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '-');
}

function ProductTile({
    product,
    index,
}: {
    product: RelatedProduct;
    index: number;
}) {
    return (
        <article className="group min-w-0">
            <div className="relative aspect-[0.91] overflow-hidden bg-[#ded7cc]">
                <Link
                    href={showProduct(product.slug)}
                    className="block h-full w-full"
                    aria-label={`View ${product.name}`}
                >
                    <img
                        src={imageFor(product.image_url, index)}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                </Link>
                <button
                    type="button"
                    className="absolute top-3 right-3 grid h-7 w-7 place-items-center text-[#171716]"
                    aria-label={`Save ${product.name}`}
                >
                    <Heart className="h-4 w-4 stroke-[1.5]" />
                </button>
            </div>
            <Link
                href={showProduct(product.slug)}
                className="mt-3 block truncate text-[13px] leading-tight font-medium"
            >
                {product.name}
            </Link>
            <p className="mt-1 text-[12px] leading-tight font-semibold">
                {formatPrice(product.price_cents, product.currency)}
            </p>
            <div className="mt-3 flex gap-2">
                {(product.colors.length
                    ? product.colors
                    : [{ name: 'Stone', hex: '#d9cfbd' }]
                ).map((color) => (
                    <span
                        key={`${product.id}-${color.name}-${color.hex}`}
                        className="h-3 w-3 rounded-full border border-black/15"
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                    />
                ))}
            </div>
        </article>
    );
}

export default function Show({ product, relatedProducts }: Props) {
    const { cart } = usePage().props;
    const images = product.images.length ? product.images : [product.image_url];
    const availableVariants = useMemo(
        () => product.variants.filter((variant) => variant.stock_quantity > 0),
        [product.variants],
    );
    const colorOptions = useMemo(() => {
        const colors = new Map<string, ProductColor>();

        availableVariants.forEach((variant) => {
            colors.set(variant.color_name, {
                name: variant.color_name,
                hex: variant.color_hex || '#d9cfbd',
            });
        });

        return Array.from(colors.values());
    }, [availableVariants]);
    const sizeOptions = product.sizes.length
        ? product.sizes
        : ['S', 'M', 'L', 'XL'];
    const firstVariant = availableVariants[0];
    const [selectedColorName, setSelectedColorName] = useState(
        firstVariant?.color_name ?? colorOptions[0]?.name ?? '',
    );
    const [selectedSize, setSelectedSize] = useState(
        firstVariant?.size ?? sizeOptions[0] ?? '',
    );
    const selectedColor = colorOptions.find(
        (color) => color.name === selectedColorName,
    );
    const selectedVariant = availableVariants.find(
        (variant) =>
            variant.color_name === selectedColorName &&
            variant.size === selectedSize,
    );
    const form = useForm({
        product_variant_id: selectedVariant?.id ?? 0,
        quantity: 1,
    });

    useEffect(() => {
        form.setData('product_variant_id', selectedVariant?.id ?? 0);
    }, [selectedVariant?.id]);

    useEffect(() => {
        if (!selectedColorName) {
            return;
        }

        const sizeIsAvailable = availableVariants.some(
            (variant) =>
                variant.color_name === selectedColorName &&
                variant.size === selectedSize,
        );

        if (sizeIsAvailable) {
            return;
        }

        const nextVariant = availableVariants.find(
            (variant) => variant.color_name === selectedColorName,
        );

        if (nextVariant) {
            setSelectedSize(nextVariant.size);
        }
    }, [availableVariants, selectedColorName, selectedSize]);

    const submitCart = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!selectedVariant) {
            form.setError(
                'product_variant_id',
                'Choose an available color and size.',
            );

            return;
        }

        form.post(storeCartItem.url(), {
            preserveScroll: true,
        });
    };

    const isSizeAvailable = (size: string): boolean =>
        availableVariants.some(
            (variant) =>
                variant.color_name === selectedColorName &&
                variant.size === size,
        );

    return (
        <>
            <Head title={`${product.name} | Doren`} />

            <div className="min-h-screen bg-[#f5f1e9] text-[#151513] antialiased">
                <div className="bg-[#12110f] px-4 py-2 text-center text-[12px] leading-none text-[#f6f1e9]">
                    Complimentary shipping on orders over $150
                </div>

                <header className="sticky top-0 z-40 border-b border-[#dfd8cc] bg-[#f8f4ed]/95 backdrop-blur">
                    <div className="mx-auto flex h-[68px] max-w-[1158px] items-center justify-between px-6">
                        <Link
                            href={home()}
                            className="[font-family:Georgia,_serif] text-[31px] leading-none font-medium tracking-[0.04em]"
                        >
                            DOREN
                        </Link>
                        <nav className="hidden items-center gap-11 text-[11px] font-bold tracking-[0.12em] uppercase lg:flex">
                            {navigationItems.map((item) => (
                                <Link
                                    key={item}
                                    href={`${home.url()}#${sectionId(item)}`}
                                >
                                    {item}
                                </Link>
                            ))}
                        </nav>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="hidden h-9 w-9 place-items-center sm:grid"
                                aria-label="Search"
                            >
                                <Search className="h-5 w-5 stroke-[1.6]" />
                            </button>
                            <Link
                                href={login()}
                                className="hidden h-9 w-9 place-items-center sm:grid"
                                aria-label="Log in"
                            >
                                <User className="h-5 w-5 stroke-[1.6]" />
                            </Link>
                            <Link
                                href={cartRoute()}
                                className="relative h-9 w-9"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag className="mx-auto h-5 w-5 stroke-[1.6]" />
                                <span className="absolute top-0 right-1 grid h-4 w-4 place-items-center rounded-full bg-[#151513] text-[9px] font-bold text-white">
                                    {cart.count}
                                </span>
                            </Link>
                        </div>
                    </div>
                </header>

                <main>
                    <section className="mx-auto grid max-w-[1158px] gap-8 px-6 py-7 lg:grid-cols-[1.18fr_0.82fr]">
                        <div className="grid gap-4 sm:grid-cols-[76px_1fr]">
                            <div className="hidden gap-3 sm:grid">
                                {images.slice(0, 5).map((image, index) => (
                                    <button
                                        key={`${image}-${index}`}
                                        type="button"
                                        className="aspect-[0.78] overflow-hidden border border-[#d6cec0] bg-[#ded7cc]"
                                        aria-label={`Preview image ${index + 1}`}
                                    >
                                        <img
                                            src={imageFor(image, index)}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>

                            <div className="relative aspect-[0.86] overflow-hidden bg-[#ded7cc]">
                                <span className="absolute top-4 left-4 z-10 bg-[#8d6b35] px-3 py-2 text-[10px] leading-none font-bold tracking-[0.08em] text-white uppercase">
                                    Best Seller
                                </span>
                                <img
                                    src={imageFor(images[0], 0)}
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                />
                                <button
                                    type="button"
                                    className="absolute right-4 bottom-4 grid h-10 w-10 place-items-center rounded-full bg-white text-[#151513] shadow-sm"
                                    aria-label="Zoom product image"
                                >
                                    <ZoomIn className="h-4 w-4" />
                                </button>
                            </div>
                        </div>

                        <div className="lg:pt-3">
                            <div className="mb-5 flex flex-wrap items-center gap-2 text-[11px] text-[#756e62]">
                                <Link href={home()}>Home</Link>
                                <span>/</span>
                                {product.category && (
                                    <>
                                        <Link
                                            href={`${home.url()}#${product.category.slug}`}
                                        >
                                            {product.category.name}
                                        </Link>
                                        <span>/</span>
                                    </>
                                )}
                                <span className="text-[#151513]">
                                    {product.name}
                                </span>
                            </div>

                            <h1 className="[font-family:Georgia,_serif] text-[38px] leading-[1.05] font-medium tracking-normal sm:text-[44px]">
                                {product.name}
                            </h1>
                            <p className="mt-3 text-[18px] font-semibold">
                                {formatPrice(
                                    product.price_cents,
                                    product.currency,
                                )}
                            </p>
                            {product.description && (
                                <p className="mt-5 max-w-[430px] border-b border-[#d6cec0] pb-6 text-[14px] leading-6 text-[#494238]">
                                    {product.description}
                                </p>
                            )}

                            <div className="mt-6">
                                <div className="flex items-center gap-2 text-[11px] tracking-[0.08em] uppercase">
                                    <span>Color:</span>
                                    <span className="font-semibold">
                                        {selectedColor?.name ?? 'Select color'}
                                    </span>
                                </div>
                                <div className="mt-3 flex gap-3">
                                    {colorOptions.map((color) => (
                                        <button
                                            key={`${color.name}-${color.hex}`}
                                            type="button"
                                            onClick={() =>
                                                setSelectedColorName(color.name)
                                            }
                                            className={`h-7 w-7 rounded-full border ${selectedColorName === color.name ? 'border-[#151513] p-1' : 'border-black/10 p-0'}`}
                                            aria-label={`Select ${color.name}`}
                                            aria-pressed={
                                                selectedColorName === color.name
                                            }
                                        >
                                            <span
                                                className="block h-full w-full rounded-full border border-black/10"
                                                style={{
                                                    backgroundColor: color.hex,
                                                }}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <form onSubmit={submitCart}>
                                <div className="mt-6">
                                    <div className="flex items-center justify-between gap-4">
                                        <span className="text-[11px] tracking-[0.08em] uppercase">
                                            Size:
                                        </span>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 text-[11px] text-[#494238]"
                                        >
                                            <Ruler className="h-3.5 w-3.5" />
                                            Size Guide
                                        </button>
                                    </div>
                                    <div className="mt-3 grid grid-cols-5 gap-2">
                                        {sizeOptions.map((size) => {
                                            const available =
                                                isSizeAvailable(size);

                                            return (
                                                <button
                                                    key={size}
                                                    type="button"
                                                    disabled={!available}
                                                    onClick={() =>
                                                        setSelectedSize(size)
                                                    }
                                                    className={`h-8 border text-[11px] font-medium ${selectedSize === size ? 'border-[#151513] bg-[#151513] text-white' : 'border-[#d6cec0] bg-[#f8f4ed]'} ${available ? '' : 'cursor-not-allowed text-[#a39a8c] line-through opacity-50'}`}
                                                    aria-pressed={
                                                        selectedSize === size
                                                    }
                                                >
                                                    {size}
                                                </button>
                                            );
                                        })}
                                    </div>
                                    {(form.errors.product_variant_id ||
                                        form.errors.quantity) && (
                                        <p className="mt-3 text-[12px] text-red-700">
                                            {form.errors.product_variant_id ||
                                                form.errors.quantity}
                                        </p>
                                    )}
                                </div>

                                <div className="mt-6 grid gap-3">
                                    <button
                                        type="submit"
                                        disabled={
                                            !selectedVariant || form.processing
                                        }
                                        className="inline-flex h-12 items-center justify-center gap-3 bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase disabled:cursor-not-allowed disabled:bg-[#8f887d]"
                                    >
                                        {form.processing
                                            ? 'Adding...'
                                            : form.recentlySuccessful
                                              ? 'Added'
                                              : 'Add To Cart'}
                                        <ShoppingBag className="h-4 w-4" />
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={
                                            !selectedVariant || form.processing
                                        }
                                        className="h-12 border border-[#d6cec0] bg-[#f8f4ed] px-6 text-[11px] font-bold tracking-[0.12em] uppercase disabled:cursor-not-allowed disabled:text-[#8f887d]"
                                    >
                                        Buy It Now
                                    </button>
                                </div>
                            </form>

                            <div className="mt-6 divide-y divide-[#d6cec0] border border-[#d6cec0] bg-[#f8f4ed]">
                                {[
                                    [
                                        Truck,
                                        'Free Shipping',
                                        'On orders over $150',
                                    ],
                                    [
                                        PackageCheck,
                                        'Easy Returns',
                                        '30-day returns & exchanges',
                                    ],
                                    [
                                        LockKeyhole,
                                        'Secure Payment',
                                        'Safe & encrypted checkout',
                                    ],
                                ].map(([Icon, title, description]) => (
                                    <button
                                        key={title as string}
                                        type="button"
                                        className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left"
                                    >
                                        <span className="flex items-center gap-3">
                                            <Icon className="h-5 w-5 stroke-[1.4]" />
                                            <span>
                                                <span className="block text-[11px] font-bold">
                                                    {title as string}
                                                </span>
                                                <span className="text-[11px] text-[#756e62]">
                                                    {description as string}
                                                </span>
                                            </span>
                                        </span>
                                        <ChevronDown className="h-4 w-4" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="mx-auto max-w-[1158px] border-t border-[#ddd6ca] px-6 py-7">
                        <div className="grid gap-6 border border-[#d6cec0] bg-[#f8f4ed] p-5 lg:grid-cols-[0.92fr_1.08fr]">
                            <div>
                                <div className="flex gap-9 border-b border-[#d6cec0] pb-4 text-[10px] font-bold tracking-[0.08em] uppercase">
                                    <span>Description</span>
                                    <span className="text-[#756e62]">
                                        Details
                                    </span>
                                    <span className="text-[#756e62]">
                                        Care Guide
                                    </span>
                                </div>
                                <p className="mt-5 text-[13px] leading-6 text-[#494238]">
                                    {product.description ??
                                        'A refined staple crafted for effortless everyday style.'}
                                </p>
                                <ul className="mt-4 grid gap-1 text-[12px] leading-5 text-[#494238]">
                                    <li>
                                        100% premium cotton or natural blend
                                    </li>
                                    <li>Soft, breathable hand feel</li>
                                    <li>Clean fit for everyday comfort</li>
                                    <li>Finished collar and cuffs</li>
                                </ul>
                            </div>
                            <div className="aspect-[2.12] overflow-hidden bg-[#ded7cc]">
                                <img
                                    src={imageFor(images[1] ?? images[0], 1)}
                                    alt={`${product.name} detail`}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                        </div>
                    </section>

                    {relatedProducts.length > 0 && (
                        <section className="mx-auto max-w-[1158px] border-t border-[#ddd6ca] px-6 py-7">
                            <div className="flex items-center justify-between gap-4">
                                <h2 className="text-[14px] font-bold tracking-[0.08em] uppercase">
                                    You May Also Like
                                </h2>
                                <Link
                                    href={`${home.url()}#new-in`}
                                    className="inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.08em] uppercase"
                                >
                                    View All <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-5">
                                {relatedProducts.map(
                                    (relatedProduct, index) => (
                                        <ProductTile
                                            key={relatedProduct.id}
                                            product={relatedProduct}
                                            index={index}
                                        />
                                    ),
                                )}
                            </div>
                        </section>
                    )}

                    <section className="border-y border-[#ddd6ca] bg-[#f8f4ed]">
                        <div className="mx-auto grid max-w-[1158px] grid-cols-1 divide-y divide-[#ddd6ca] px-6 py-5 md:grid-cols-3 md:divide-x md:divide-y-0">
                            {[
                                [
                                    'Thoughtfully Sourced',
                                    'We source the finest materials with care',
                                ],
                                [
                                    'Expertly Crafted',
                                    'Attention to detail in every piece we create',
                                ],
                                [
                                    'Made To Last',
                                    'Quality you can rely on, season after season',
                                ],
                            ].map(([title, description]) => (
                                <div
                                    key={title}
                                    className="flex items-center gap-5 px-0 py-4 md:px-12"
                                >
                                    <ShieldCheck className="h-8 w-8 shrink-0 stroke-[1.3]" />
                                    <div>
                                        <p className="text-[10px] font-bold tracking-[0.08em] uppercase">
                                            {title}
                                        </p>
                                        <p className="mt-1 text-[11px] leading-snug text-[#4f493f]">
                                            {description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <footer className="bg-[#11191b] text-[#f4f1ea]">
                    <div className="mx-auto flex max-w-[1158px] flex-col gap-8 px-6 py-8 md:flex-row md:items-start md:justify-between">
                        <div>
                            <p className="[font-family:Georgia,_serif] text-[31px] leading-none tracking-[0.04em]">
                                DOREN
                            </p>
                            <p className="mt-4 max-w-[240px] text-[11px] leading-5 text-[#c9c5bb]">
                                Timeless menswear designed for the modern man.
                                Quality. Simplicity. Versatility.
                            </p>
                        </div>
                        <div className="flex gap-5 text-[#c9c5bb]">
                            <Instagram className="h-4 w-4" />
                            <Youtube className="h-4 w-4" />
                            <Mail className="h-4 w-4" />
                        </div>
                    </div>
                    <div className="mx-auto flex max-w-[1158px] flex-col gap-4 border-t border-white/10 px-6 py-4 text-[10px] text-[#c9c5bb] sm:flex-row sm:items-center sm:justify-between">
                        <Link
                            href={home()}
                            className="inline-flex items-center gap-2"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to shop
                        </Link>
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 self-start sm:self-auto"
                        >
                            United States (USD $)
                            <ChevronDown className="h-4 w-4" />
                        </button>
                    </div>
                </footer>
            </div>
        </>
    );
}
