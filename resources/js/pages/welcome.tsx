import { Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Heart,
    Instagram,
    Search,
    ShieldCheck,
    ShoppingBag,
    X,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { FormEvent } from 'react';

import BrandLogo from '@/components/brand-logo';
import StorefrontNavigation from '@/components/storefront-navigation';
import { cart as cartRoute } from '@/routes';
import { home } from '@/routes';
import { show as showCollection } from '@/routes/collections';
import { show as showProduct } from '@/routes/products';

type StoreCategory = {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string | null;
};

type StoreProduct = {
    id: number;
    name: string;
    slug: string;
    price_cents: number;
    compare_at_price_cents: number | null;
    campaign: { id: number; name: string } | null;
    currency: string;
    image_url: string | null;
    is_featured: boolean;
    category: {
        id: number;
        name: string;
        slug: string;
    } | null;
    colors: {
        name: string;
        hex: string;
    }[];
};

type StorefrontBanner = {
    id: number;
    position: string;
    eyebrow: string | null;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    primary_action_label: string | null;
    primary_action_url: string | null;
    secondary_action_label: string | null;
    secondary_action_url: string | null;
    image_url: string | null;
};

type PaginatedProducts = {
    data: StoreProduct[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
};

type Props = {
    search: string;
    activeCategory: {
        id: number;
        name: string;
        slug: string;
        description: string | null;
    } | null;
    banners: {
        top: StorefrontBanner | null;
        hero: StorefrontBanner[];
        bottom: StorefrontBanner | null;
    };
    categories: StoreCategory[];
    newInProducts: PaginatedProducts;
    bestSellerProducts: StoreProduct[];
};

const fallbackImages = [
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=85',
    '/Images/bluza-category.webp',
];

const bluzaCategoryImage = '/Images/bluza-category.webp';

const heroImage =
    'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1800&q=90';

const bannerImage =
    'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=1800&q=90';

const carouselIntervalMs = 6000;
const instagramUrl = 'https://www.instagram.com/doren.ks/?hl=en';

function imageFor(value: string | null, index: number): string {
    return value || fallbackImages[index % fallbackImages.length];
}

function CategoryCardImage({
    category,
    index,
}: {
    category: StoreCategory;
    index: number;
}) {
    const fallbackImage =
        category.slug === 'sweatshirts'
            ? bluzaCategoryImage
            : imageFor(null, index);
    const [source, setSource] = useState<string | null>(
        category.image_url || fallbackImage,
    );

    if (!source) {
        return null;
    }

    return (
        <img
            src={source}
            alt={`${category.name} collection`}
            loading="lazy"
            decoding="async"
            onError={() =>
                setSource(source === fallbackImage ? null : fallbackImage)
            }
            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
        />
    );
}

function formatPrice(product: StoreProduct): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'EUR',
        minimumFractionDigits: 2,
    }).format(product.price_cents / 100);
}

function paginationPages(currentPage: number, lastPage: number): number[] {
    if (lastPage <= 7) {
        return Array.from({ length: lastPage }, (_, index) => index + 1);
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(lastPage - 1, currentPage + 1);
    const pages = [1];

    if (start > 2) {
        pages.push(-1);
    }

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < lastPage - 1) {
        pages.push(-2);
    }

    pages.push(lastPage);

    return pages;
}

function bannerTitleLines(title: string, fallback: string): string[] {
    const value = title || fallback;

    if (value.includes('. ')) {
        return value
            .split('. ')
            .map((line, index, lines) =>
                index < lines.length - 1 ? `${line}.` : line,
            );
    }

    return value.replace(' For ', '\nFor ').split('\n');
}

function categoryHref(categorySlug: string) {
    return showCollection.url(categorySlug);
}

function productPageHref(
    page: number,
    categorySlug?: string,
    search?: string,
): string {
    const options = {
        query: {
            ...(page > 1 ? { page } : {}),
            ...(search ? { search } : {}),
        },
    };

    return `${categorySlug ? showCollection.url(categorySlug, options) : home.url(options)}#new-in`;
}

function productColorHref(product: StoreProduct, colorName: string): string {
    return showProduct.url(product.slug, {
        query: {
            color: colorName,
        },
    });
}

function useCarouselIndex(
    items: StorefrontBanner[],
): [number, (index: number) => void, () => void, () => void] {
    const [activeIndex, setActiveIndex] = useState(0);
    const itemCount = items.length;

    useEffect(() => {
        if (itemCount <= 1) {
            return;
        }

        const interval = window.setInterval(() => {
            setActiveIndex((current) => (current + 1) % itemCount);
        }, carouselIntervalMs);

        return () => window.clearInterval(interval);
    }, [itemCount]);

    const choose = (index: number) => {
        setActiveIndex(index);
    };

    const previous = () => {
        setActiveIndex((current) => (current - 1 + itemCount) % itemCount);
    };

    const next = () => {
        setActiveIndex((current) => (current + 1) % itemCount);
    };

    return [
        Math.min(activeIndex, Math.max(itemCount - 1, 0)),
        choose,
        previous,
        next,
    ];
}

function CarouselDots({
    items,
    activeIndex,
    onSelect,
    label,
}: {
    items: StorefrontBanner[];
    activeIndex: number;
    onSelect: (index: number) => void;
    label: string;
}) {
    if (items.length <= 1) {
        return null;
    }

    return (
        <div className="flex items-center gap-2" aria-label={label}>
            {items.map((item, index) => (
                <button
                    key={item.id}
                    type="button"
                    className={`h-1.5 rounded-full transition-all ${index === activeIndex ? 'w-6 bg-[#151513]' : 'w-1.5 bg-[#151513]/35 hover:bg-[#151513]/65'}`}
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === activeIndex ? 'true' : undefined}
                    onClick={() => onSelect(index)}
                />
            ))}
        </div>
    );
}

function HeroCarousel({ banners }: { banners: StorefrontBanner[] }) {
    const [activeIndex, choose, previous, next] = useCarouselIndex(banners);
    const activeBanner = banners[activeIndex];
    const heroTitleLines = bannerTitleLines(
        activeBanner?.title ?? '',
        'Timeless style. Modern man.',
    );

    return (
        <section className="relative overflow-hidden bg-[#e8ded2]">
            <div className="mx-auto grid h-[760px] max-w-[1158px] grid-cols-1 grid-rows-[430px_330px] sm:h-[720px] sm:grid-rows-[390px_330px] lg:h-[430px] lg:grid-cols-[0.92fr_1.08fr] lg:grid-rows-1">
                <div
                    className="relative z-10 flex flex-col justify-center px-10 py-12 lg:px-12"
                    aria-live="polite"
                >
                    <h1 className="[font-family:Georgia,_serif] text-[48px] leading-[0.96] font-medium tracking-normal sm:text-[58px]">
                        {heroTitleLines.map((line) => (
                            <span key={line} className="block">
                                {line}
                            </span>
                        ))}
                    </h1>
                    <p className="mt-6 max-w-[410px] text-[15px] leading-6 text-[#34312b]">
                        {activeBanner?.subtitle ??
                            'Refined essentials, masterfully crafted. For the man who values quality in every detail.'}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-4">
                        <a
                            href="#new-in"
                            className="inline-flex h-11 items-center bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase"
                        >
                            Shop Collection
                        </a>
                        <a
                            href="#shop-by-category"
                            className="inline-flex h-11 items-center border border-[#24221f] px-6 text-[11px] font-bold tracking-[0.12em] uppercase"
                        >
                            Explore
                        </a>
                    </div>
                    <div className="mt-8">
                        <CarouselDots
                            items={banners}
                            activeIndex={activeIndex}
                            onSelect={choose}
                            label="Hero slides"
                        />
                    </div>
                </div>
                <div className="relative min-h-[330px]">
                    <img
                        key={activeBanner?.id ?? 'hero-fallback'}
                        src={activeBanner?.image_url ?? heroImage}
                        alt={activeBanner?.title ?? 'Doren olive polo outfit'}
                        fetchPriority="high"
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover object-center transition duration-500"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-[#e8ded2]/80 via-transparent to-transparent" />
                    {banners.length > 1 && (
                        <div className="absolute right-5 bottom-5 flex gap-2">
                            <button
                                type="button"
                                className="grid h-10 w-10 place-items-center bg-[#f8f4ed]/90 text-[#151513] transition hover:bg-[#151513] hover:text-white"
                                aria-label="Previous hero slide"
                                onClick={previous}
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                className="grid h-10 w-10 place-items-center bg-[#f8f4ed]/90 text-[#151513] transition hover:bg-[#151513] hover:text-white"
                                aria-label="Next hero slide"
                                onClick={next}
                            >
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

function BottomCampaign({ banner }: { banner: StorefrontBanner | null }) {
    const bottomTitleLines = bannerTitleLines(
        banner?.title ?? '',
        'Elevated Essentials For Every Day',
    );

    return (
        <section className="relative min-h-[195px] overflow-hidden bg-[#d8d3ca]">
            <img
                src={banner?.image_url ?? bannerImage}
                alt={banner?.title ?? 'Doren spring summer tailoring'}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-linear-to-r from-[#e8e0d4] via-[#e8e0d4]/70 to-transparent" />
            <div className="relative mx-auto flex min-h-[195px] max-w-[1158px] items-center px-10 py-8">
                <div className="max-w-[360px]">
                    <p className="text-[10px] font-bold tracking-[0.18em] text-[#8d6b35] uppercase">
                        {banner?.eyebrow ?? 'Spring / Summer 2026'}
                    </p>
                    <h2 className="mt-3 [font-family:Georgia,_serif] text-[33px] leading-[1.02] font-medium">
                        {bottomTitleLines.map((line) => (
                            <span key={line} className="block">
                                {line}
                            </span>
                        ))}
                    </h2>
                    <p className="mt-4 text-[12px] leading-5 text-[#3f3a33]">
                        {banner?.body ??
                            'Versatile pieces. Timeless appeal. Designed for wherever life takes you.'}
                    </p>
                    {(banner?.primary_action_label ??
                        'Explore The Collection') && (
                        <a
                            href={banner?.primary_action_url ?? '#new-in'}
                            className="mt-4 inline-flex h-9 items-center bg-[#11110f] px-5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
                        >
                            {banner?.primary_action_label ??
                                'Explore The Collection'}
                        </a>
                    )}
                </div>
            </div>
        </section>
    );
}

function ProductCard({
    product,
    index,
    badge,
}: {
    product: StoreProduct;
    index: number;
    badge?: string;
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
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
                    />
                    {badge && (
                        <span className="absolute top-3 left-3 bg-[#8d6b35] px-2 py-1 text-[9px] leading-none font-bold tracking-[0.08em] text-white uppercase">
                            {badge}
                        </span>
                    )}
                </Link>
                <button
                    type="button"
                    className="absolute top-3 right-3 grid h-7 w-7 place-items-center text-[#171716]"
                    aria-label={`Save ${product.name}`}
                >
                    <Heart className="h-4 w-4 stroke-[1.5]" />
                </button>
            </div>
            <div className="mt-3">
                <Link
                    href={showProduct(product.slug)}
                    className="block truncate text-[13px] leading-tight font-medium"
                >
                    {product.name}
                </Link>
                <div className="mt-1 flex items-center gap-2 text-[12px] leading-tight font-semibold">
                    <span>{formatPrice(product)}</span>
                    {product.compare_at_price_cents && (
                        <span className="font-normal text-[#756e62] line-through">
                            {new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: product.currency || 'EUR',
                            }).format(product.compare_at_price_cents / 100)}
                        </span>
                    )}
                    {product.campaign && (
                        <span className="text-red-700">
                            {product.campaign.name}
                        </span>
                    )}
                </div>
                <div className="mt-3 flex gap-2">
                    {(product.colors.length
                        ? product.colors
                        : [{ name: 'Stone', hex: '#d9cfbd' }]
                    ).map((color) => (
                        <Link
                            key={`${product.id}-${color.name}-${color.hex}`}
                            href={productColorHref(product, color.name)}
                            className="h-3 w-3 rounded-full border border-black/15 ring-offset-2 ring-offset-[#f5f1e9] transition hover:ring-1 hover:ring-[#151513] focus:ring-1 focus:ring-[#151513] focus:outline-none"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                            aria-label={`View ${product.name} in ${color.name}`}
                        />
                    ))}
                </div>
            </div>
        </article>
    );
}

function ProductRail({
    id,
    title,
    products,
    featuredBadges = false,
}: {
    id: string;
    title: string;
    products: StoreProduct[];
    featuredBadges?: boolean;
}) {
    if (products.length === 0) {
        return null;
    }

    return (
        <section
            id={id}
            className="mx-auto max-w-[1158px] border-t border-[#ddd6ca] px-6 py-7"
        >
            <div className="flex items-center justify-between gap-4">
                <h2 className="text-[14px] font-bold tracking-[0.08em] uppercase">
                    {title}
                </h2>
                <a
                    href="#newsletter"
                    className="inline-flex items-center gap-3 text-[10px] font-semibold tracking-[0.08em] uppercase"
                >
                    View All <ArrowRight className="h-4 w-4" />
                </a>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 md:grid-cols-3 lg:grid-cols-6">
                {products.map((product, index) => (
                    <ProductCard
                        key={`${id}-${product.id}`}
                        product={product}
                        index={index}
                        badge={
                            featuredBadges && product.is_featured
                                ? 'Best Seller'
                                : undefined
                        }
                    />
                ))}
            </div>
        </section>
    );
}

function ProductPagination({
    pagination,
    categorySlug,
    search,
}: {
    pagination: PaginatedProducts;
    categorySlug?: string;
    search?: string;
}) {
    if (pagination.last_page <= 1) {
        return null;
    }

    const pages = paginationPages(
        pagination.current_page,
        pagination.last_page,
    );

    return (
        <nav
            className="mx-auto flex max-w-[1158px] items-center justify-center gap-2 px-6 pb-9"
            aria-label="Product pagination"
        >
            {pagination.current_page > 1 ? (
                <Link
                    href={productPageHref(
                        pagination.current_page - 1,
                        categorySlug,
                        search,
                    )}
                    className="grid h-9 w-9 place-items-center border border-[#cfc6b8] transition hover:bg-[#151513] hover:text-white"
                    aria-label="Previous product page"
                >
                    <ArrowLeft className="h-4 w-4" />
                </Link>
            ) : (
                <span
                    className="grid h-9 w-9 place-items-center border border-[#ded7cc] text-[#aaa196]"
                    aria-hidden="true"
                >
                    <ArrowLeft className="h-4 w-4" />
                </span>
            )}

            {pages.map((page) =>
                page < 0 ? (
                    <span
                        key={page}
                        className="grid h-9 min-w-9 place-items-center text-[11px]"
                        aria-hidden="true"
                    >
                        …
                    </span>
                ) : (
                    <Link
                        key={page}
                        href={productPageHref(page, categorySlug, search)}
                        className={`grid h-9 min-w-9 place-items-center border px-2 text-[11px] font-bold ${page === pagination.current_page ? 'border-[#151513] bg-[#151513] text-white' : 'border-[#cfc6b8] transition hover:bg-[#151513] hover:text-white'}`}
                        aria-label={`Product page ${page}`}
                        aria-current={
                            page === pagination.current_page
                                ? 'page'
                                : undefined
                        }
                    >
                        {page}
                    </Link>
                ),
            )}

            {pagination.current_page < pagination.last_page ? (
                <Link
                    href={productPageHref(
                        pagination.current_page + 1,
                        categorySlug,
                        search,
                    )}
                    className="grid h-9 w-9 place-items-center border border-[#cfc6b8] transition hover:bg-[#151513] hover:text-white"
                    aria-label="Next product page"
                >
                    <ArrowRight className="h-4 w-4" />
                </Link>
            ) : (
                <span
                    className="grid h-9 w-9 place-items-center border border-[#ded7cc] text-[#aaa196]"
                    aria-hidden="true"
                >
                    <ArrowRight className="h-4 w-4" />
                </span>
            )}
        </nav>
    );
}

export default function Welcome({
    search,
    activeCategory,
    banners,
    categories,
    newInProducts,
    bestSellerProducts,
}: Props) {
    const { cart } = usePage().props;
    const heroBanners = banners.hero ?? [];
    const [isSearchOpen, setIsSearchOpen] = useState(search !== '');
    const [searchValue, setSearchValue] = useState(search);
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!isSearchOpen) {
            return;
        }

        searchInputRef.current?.focus();

        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsSearchOpen(false);
            }
        };

        window.addEventListener('keydown', closeOnEscape);

        return () => window.removeEventListener('keydown', closeOnEscape);
    }, [isSearchOpen]);

    const submitSearch = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const normalizedSearch = searchValue.trim();

        router.get(
            activeCategory
                ? showCollection.url(activeCategory.slug)
                : home.url(),
            normalizedSearch ? { search: normalizedSearch } : {},
            {
                preserveState: true,
                replace: true,
                onSuccess: () => {
                    document
                        .getElementById('new-in')
                        ?.scrollIntoView({ behavior: 'smooth' });
                },
            },
        );
    };

    const clearSearch = () => {
        setSearchValue('');

        router.get(
            activeCategory
                ? showCollection.url(activeCategory.slug)
                : home.url(),
            {},
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <div className="min-h-screen bg-[#f5f1e9] text-[#151513] antialiased">
                <header className="sticky top-0 z-40 border-b border-[#dfd8cc] bg-[#f8f4ed]/95 backdrop-blur">
                    <div className="mx-auto flex h-[68px] max-w-[1158px] items-center justify-between px-6">
                        <StorefrontNavigation
                            activeCategorySlug={activeCategory?.slug}
                            isNewInActive={!activeCategory && !search}
                            mobile
                            preserveScroll
                        />

                        <Link
                            href="/"
                            className="flex h-12 w-28 items-center justify-center sm:w-32"
                        >
                            <BrandLogo className="h-12 w-full object-cover object-center" />
                        </Link>

                        <StorefrontNavigation
                            activeCategorySlug={activeCategory?.slug}
                            isNewInActive={!activeCategory && !search}
                            preserveScroll
                        />

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="grid h-9 w-9 place-items-center"
                                aria-label={
                                    isSearchOpen
                                        ? 'Close search'
                                        : 'Open search'
                                }
                                aria-expanded={isSearchOpen}
                                aria-controls="storefront-search"
                                onClick={() => setIsSearchOpen((open) => !open)}
                            >
                                {isSearchOpen ? (
                                    <X className="h-5 w-5 stroke-[1.6]" />
                                ) : (
                                    <Search className="h-5 w-5 stroke-[1.6]" />
                                )}
                            </button>
                            <Link
                                href={cartRoute()}
                                className="relative grid h-9 w-9 place-items-center"
                                aria-label="Shopping bag"
                            >
                                <ShoppingBag className="h-5 w-5 stroke-[1.6]" />
                                <span className="absolute top-0 right-1 grid h-4 w-4 place-items-center rounded-full bg-[#151513] text-[9px] font-bold text-white">
                                    {cart.count}
                                </span>
                            </Link>
                        </div>
                    </div>
                    <div
                        id="storefront-search"
                        className={`absolute inset-x-0 top-full border-b border-[#dfd8cc] bg-[#f8f4ed] shadow-sm transition duration-200 ease-out ${isSearchOpen ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-2 opacity-0'}`}
                    >
                        <form
                            className="mx-auto flex max-w-[760px] items-center gap-3 px-6 py-4"
                            role="search"
                            onSubmit={submitSearch}
                        >
                            <Search
                                className="h-5 w-5 shrink-0 stroke-[1.5] text-[#655f55]"
                                aria-hidden="true"
                            />
                            <input
                                ref={searchInputRef}
                                type="search"
                                name="search"
                                value={searchValue}
                                onChange={(event) =>
                                    setSearchValue(event.target.value)
                                }
                                placeholder="Search products"
                                autoComplete="off"
                                className="h-10 min-w-0 flex-1 border-0 border-b border-[#bdb4a7] bg-transparent px-1 text-sm transition outline-none focus:border-[#151513]"
                            />
                            {searchValue && (
                                <button
                                    type="button"
                                    className="text-[10px] font-bold tracking-[0.1em] uppercase"
                                    onClick={clearSearch}
                                >
                                    Clear
                                </button>
                            )}
                            <button
                                type="submit"
                                className="inline-flex h-10 items-center bg-[#151513] px-5 text-[10px] font-bold tracking-[0.1em] text-white uppercase transition hover:bg-[#34312b]"
                            >
                                Search
                            </button>
                        </form>
                    </div>
                </header>

                <main>
                    {!activeCategory && !search && (
                        <HeroCarousel banners={heroBanners} />
                    )}

                    {activeCategory && !search && (
                        <section className="mx-auto max-w-[1158px] px-6 pt-12 pb-6">
                            <p className="text-[10px] font-bold tracking-[0.14em] text-[#8d6b35] uppercase">
                                Doren · Prizren, Kosovo
                            </p>
                            <h1 className="mt-3 [font-family:Georgia,_serif] text-[38px] leading-tight sm:text-[48px]">
                                Men's {activeCategory.name}
                            </h1>
                            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#655f55]">
                                {activeCategory.description ??
                                    `Explore Doren men's ${activeCategory.name.toLowerCase()}.`}{' '}
                                Delivery to Kosovo, Albania and North Macedonia.
                            </p>
                        </section>
                    )}

                    {search && (
                        <h1 className="mx-auto max-w-[1158px] px-6 pt-10 [font-family:Georgia,_serif] text-[32px]">
                            Search results for “{search}”
                        </h1>
                    )}

                    {categories.length > 0 && (
                        <section
                            id="shop-by-category"
                            className="mx-auto max-w-[1158px] px-6 py-7"
                        >
                            <h2 className="text-center text-[14px] font-bold tracking-[0.08em] uppercase">
                                Shop By Category
                            </h2>
                            {!activeCategory && !search && (
                                <p className="mt-3 text-center text-sm text-[#655f55]">
                                    Doren menswear from Prizren, Kosovo, with
                                    delivery to Kosovo, Albania and North
                                    Macedonia.
                                </p>
                            )}
                            {activeCategory && (
                                <div className="mt-3 flex justify-center">
                                    <Link
                                        href={home()}
                                        preserveScroll
                                        className="inline-flex h-8 items-center border border-[#d6cec0] bg-[#f8f4ed] px-4 text-[10px] font-bold tracking-[0.1em] uppercase"
                                    >
                                        Clear {activeCategory.name}
                                    </Link>
                                </div>
                            )}
                            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                {categories.map((category, index) => (
                                    <Link
                                        key={category.id}
                                        id={category.slug}
                                        href={categoryHref(category.slug)}
                                        preserveScroll
                                        className={`group relative aspect-[1.27] overflow-hidden bg-[#ded7cc] ring-offset-2 ring-offset-[#f5f1e9] ${activeCategory?.slug === category.slug ? 'ring-2 ring-[#151513]' : ''}`}
                                    >
                                        <CategoryCardImage
                                            key={category.image_url ?? ''}
                                            category={category}
                                            index={index}
                                        />
                                        <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/10 to-transparent" />
                                        <div className="absolute bottom-5 left-4 text-white">
                                            <p className="text-[15px] font-bold tracking-[0.08em] uppercase">
                                                {category.name}
                                            </p>
                                            <span className="mt-1 inline-flex items-center gap-2 text-[11px]">
                                                Shop now{' '}
                                                <ArrowRight className="h-3.5 w-3.5" />
                                            </span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )}

                    <ProductRail
                        id="new-in"
                        title={
                            search
                                ? `Search results for “${search}”`
                                : activeCategory
                                  ? `${activeCategory.name} Products`
                                  : 'New In'
                        }
                        products={newInProducts.data}
                    />
                    {search && newInProducts.data.length === 0 && (
                        <section
                            id="new-in"
                            className="mx-auto max-w-[1158px] border-t border-[#ddd6ca] px-6 py-14 text-center"
                        >
                            <h2 className="text-[14px] font-bold tracking-[0.08em] uppercase">
                                No products found
                            </h2>
                            <p className="mt-2 text-sm text-[#655f55]">
                                Try another name, description, or product code.
                            </p>
                        </section>
                    )}
                    <ProductPagination
                        pagination={newInProducts}
                        categorySlug={activeCategory?.slug}
                        search={search}
                    />
                    {!search && (
                        <ProductRail
                            id="best-sellers"
                            title="Best Sellers"
                            products={bestSellerProducts}
                            featuredBadges
                        />
                    )}

                    <BottomCampaign banner={banners.bottom} />

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

                    <section
                        id="newsletter"
                        className="mx-auto max-w-[1158px] px-6 py-5 text-center"
                    >
                        <h2 className="[font-family:Georgia,_serif] text-[28px] leading-none font-medium">
                            Stay in style
                        </h2>
                        <p className="mt-2 text-[12px] text-[#4f493f]">
                            Follow Doren on Instagram for new arrivals and
                            style inspiration.
                        </p>
                        <a
                            href={instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex h-9 items-center gap-2 bg-[#11110f] px-6 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
                        >
                            <Instagram className="h-4 w-4" />
                            Follow Doren
                        </a>
                    </section>
                </main>

                <footer className="bg-[#11191b] text-[#f4f1ea]">
                    <div className="mx-auto grid max-w-[1158px] grid-cols-1 gap-9 px-6 py-8 md:grid-cols-[1.35fr_1fr_1fr]">
                        <div>
                            <BrandLogo className="h-20 w-36 object-cover object-center" />
                            <p className="mt-4 max-w-[210px] text-[11px] leading-5 text-[#c9c5bb]">
                                Timeless menswear designed for the modern man.
                                Quality. Simplicity. Versatility.
                            </p>
                            <div className="mt-5 flex gap-5 text-[#c9c5bb]">
                                <a
                                    href={instagramUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label="Doren on Instagram"
                                    className="transition hover:text-white"
                                >
                                    <Instagram className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                        <nav aria-label="Footer shop navigation">
                            <h3 className="text-[10px] font-bold tracking-[0.12em] uppercase">
                                Shop
                            </h3>
                            <ul className="mt-3 grid gap-1 text-[11px] leading-5 text-[#c9c5bb]">
                                <li>
                                    <Link href={`${home.url()}#new-in`}>New In</Link>
                                </li>
                                {categories.map((category) => (
                                    <li key={category.id}>
                                        <Link href={showCollection(category.slug)}>
                                            {category.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </nav>
                        <div>
                            <h3 className="text-[10px] font-bold tracking-[0.12em] uppercase">
                                Doren Menswear
                            </h3>
                            <p className="mt-3 text-[11px] leading-5 text-[#c9c5bb]">
                                Based in Prizren, Kosovo. Delivery to Kosovo,
                                Albania and North Macedonia.
                            </p>
                            <a
                                href={instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-3 inline-block text-[11px] leading-5 text-[#c9c5bb] underline underline-offset-4"
                            >
                                Doren on Instagram
                            </a>
                        </div>
                    </div>
                    <div className="mx-auto flex max-w-[1158px] flex-col gap-4 border-t border-white/10 px-6 py-4 text-[10px] text-[#c9c5bb] sm:flex-row sm:items-center sm:justify-between">
                        <span>© 2026 DOREN. All rights reserved.</span>
                        <span>
                            Delivery: Kosovo · Albania · North Macedonia
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
