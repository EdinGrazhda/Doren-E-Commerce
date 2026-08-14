import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    Heart,
    Instagram,
    LockKeyhole,
    Mail,
    Menu,
    PackageCheck,
    Search,
    ShieldCheck,
    ShoppingBag,
    SlidersHorizontal,
    User,
    Youtube,
} from 'lucide-react';

import {
    cart as cartRoute,
    dashboard as adminDashboard,
    login,
} from '@/routes';
import { home } from '@/routes';
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
    description: string | null;
    price_cents: number;
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
    activeCategory: {
        id: number;
        name: string;
        slug: string;
    } | null;
    banners: Partial<Record<'top' | 'hero' | 'bottom', StorefrontBanner>>;
    categories: StoreCategory[];
    newInProducts: PaginatedProducts;
    bestSellerProducts: StoreProduct[];
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
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=85',
    'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?auto=format&fit=crop&w=900&q=85',
];

const heroImage =
    'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1800&q=90';

const bannerImage =
    'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=1800&q=90';

const benefits = [
    {
        icon: SlidersHorizontal,
        title: 'Premium Materials',
        description: 'Finest fabrics, built to last',
    },
    {
        icon: User,
        title: 'Modern Fit',
        description: 'Tailored for comfort and confidence',
    },
    {
        icon: PackageCheck,
        title: 'Easy Returns',
        description: '30-day returns & exchanges',
    },
    {
        icon: LockKeyhole,
        title: 'Secure Payments',
        description: 'Safe & encrypted checkout',
    },
];

const footerColumns = [
    [
        'Shop',
        'New In',
        'Polos',
        'Knitwear',
        'Shirts',
        'Trousers',
        'Jackets',
        'Sale',
    ],
    [
        'About',
        'Our Story',
        'Craftsmanship',
        'Sustainability',
        'Journal',
        'Careers',
    ],
    [
        'Customer Care',
        'Contact Us',
        'Shipping & Delivery',
        'Returns & Exchanges',
        'Size Guide',
        'FAQs',
    ],
    ['Legal', 'Terms & Conditions', 'Privacy Policy', 'Cookie Policy'],
];

function imageFor(value: string | null, index: number): string {
    return value || fallbackImages[index % fallbackImages.length];
}

function formatPrice(product: StoreProduct): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: product.currency || 'USD',
        minimumFractionDigits: 2,
    }).format(product.price_cents / 100);
}

function sectionId(label: string): string {
    return label.toLowerCase().replace(/\s+/g, '-');
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
    return home({
        query: {
            category: categorySlug,
        },
    });
}

function productPageHref(page: number, categorySlug?: string): string {
    return `${home.url({
        query: {
            page,
            ...(categorySlug ? { category: categorySlug } : {}),
        },
    })}#new-in`;
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
                <p className="mt-1 text-[12px] leading-tight font-semibold">
                    {formatPrice(product)}
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
}: {
    pagination: PaginatedProducts;
    categorySlug?: string;
}) {
    if (pagination.last_page <= 1) {
        return null;
    }

    const pages = Array.from(
        { length: pagination.last_page },
        (_, index) => index + 1,
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

            {pages.map((page) => (
                <Link
                    key={page}
                    href={productPageHref(page, categorySlug)}
                    className={`grid h-9 min-w-9 place-items-center border px-2 text-[11px] font-bold ${page === pagination.current_page ? 'border-[#151513] bg-[#151513] text-white' : 'border-[#cfc6b8] transition hover:bg-[#151513] hover:text-white'}`}
                    aria-label={`Product page ${page}`}
                    aria-current={
                        page === pagination.current_page ? 'page' : undefined
                    }
                >
                    {page}
                </Link>
            ))}

            {pagination.current_page < pagination.last_page ? (
                <Link
                    href={productPageHref(
                        pagination.current_page + 1,
                        categorySlug,
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
    activeCategory,
    banners,
    categories,
    newInProducts,
    bestSellerProducts,
}: Props) {
    const { auth, cart } = usePage().props;
    const topBanner = banners.top;
    const heroBanner = banners.hero;
    const bottomBanner = banners.bottom;
    const heroTitleLines = bannerTitleLines(
        heroBanner?.title ?? '',
        'Timeless style. Modern man.',
    );
    const bottomTitleLines = bannerTitleLines(
        bottomBanner?.title ?? '',
        'Elevated Essentials For Every Day',
    );

    return (
        <>
            <Head title="Doren Menswear" />

            <div className="min-h-screen bg-[#f5f1e9] text-[#151513] antialiased">
                <div className="bg-[#12110f] px-4 py-2 text-center text-[12px] leading-none text-[#f6f1e9]">
                    {topBanner?.body ??
                        'Complimentary shipping on orders over $150'}
                </div>

                <header className="sticky top-0 z-40 border-b border-[#dfd8cc] bg-[#f8f4ed]/95 backdrop-blur">
                    <div className="mx-auto flex h-[68px] max-w-[1158px] items-center justify-between px-6">
                        <button
                            type="button"
                            className="grid h-10 w-10 place-items-center lg:hidden"
                            aria-label="Open navigation"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <Link
                            href="/"
                            className="[font-family:Georgia,_serif] text-[31px] leading-none font-medium tracking-[0.04em]"
                        >
                            DOREN
                        </Link>

                        <nav className="hidden items-center gap-11 text-[11px] font-bold tracking-[0.12em] uppercase lg:flex">
                            {navigationItems.map((item) => (
                                <a key={item} href={`#${sectionId(item)}`}>
                                    {item}
                                </a>
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
                                href={auth.user ? adminDashboard() : login()}
                                className="hidden h-9 w-9 place-items-center sm:grid"
                                aria-label={auth.user ? 'Dashboard' : 'Log in'}
                            >
                                <User className="h-5 w-5 stroke-[1.6]" />
                            </Link>
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
                </header>

                <main>
                    <section className="relative overflow-hidden bg-[#e8ded2]">
                        <div className="mx-auto grid min-h-[350px] max-w-[1158px] grid-cols-1 lg:min-h-[350px] lg:grid-cols-[0.92fr_1.08fr]">
                            <div className="relative z-10 flex flex-col justify-center px-10 py-12 lg:px-12">
                                <h1 className="[font-family:Georgia,_serif] text-[48px] leading-[0.96] font-medium tracking-normal sm:text-[58px]">
                                    {heroTitleLines.map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </h1>
                                <p className="mt-6 max-w-[410px] text-[15px] leading-6 text-[#34312b]">
                                    {heroBanner?.subtitle ??
                                        'Refined essentials, masterfully crafted. For the man who values quality in every detail.'}
                                </p>
                                <div className="mt-8 flex gap-4">
                                    <a
                                        href={
                                            heroBanner?.primary_action_url ??
                                            '#new-in'
                                        }
                                        className="inline-flex h-11 items-center bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase"
                                    >
                                        {heroBanner?.primary_action_label ??
                                            'Shop Collection'}
                                    </a>
                                    {(heroBanner?.secondary_action_label ??
                                        'Explore') && (
                                        <a
                                            href={
                                                heroBanner?.secondary_action_url ??
                                                '#shop-by-category'
                                            }
                                            className="inline-flex h-11 items-center border border-[#24221f] px-6 text-[11px] font-bold tracking-[0.12em] uppercase"
                                        >
                                            {heroBanner?.secondary_action_label ??
                                                'Explore'}
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div className="relative min-h-[330px]">
                                <img
                                    src={heroBanner?.image_url ?? heroImage}
                                    alt="Doren olive polo outfit"
                                    className="absolute inset-0 h-full w-full object-cover object-center"
                                />
                                <div className="absolute inset-0 bg-linear-to-r from-[#e8ded2]/80 via-transparent to-transparent" />
                            </div>
                        </div>
                    </section>

                    <section className="border-y border-[#ddd6ca] bg-[#f8f4ed]">
                        <div className="mx-auto grid max-w-[1158px] grid-cols-1 divide-y divide-[#ddd6ca] px-6 py-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:grid-cols-4">
                            {benefits.map(
                                ({ icon: Icon, title, description }) => (
                                    <div
                                        key={title}
                                        className="flex items-center gap-5 px-0 py-4 sm:px-8 lg:min-h-[64px]"
                                    >
                                        <Icon className="h-8 w-8 shrink-0 stroke-[1.35]" />
                                        <div>
                                            <p className="text-[10px] font-bold tracking-[0.08em] uppercase">
                                                {title}
                                            </p>
                                            <p className="mt-1 text-[11px] leading-snug text-[#4f493f]">
                                                {description}
                                            </p>
                                        </div>
                                    </div>
                                ),
                            )}
                        </div>
                    </section>

                    {categories.length > 0 && (
                        <section
                            id="shop-by-category"
                            className="mx-auto max-w-[1158px] px-6 py-7"
                        >
                            <h2 className="text-center text-[14px] font-bold tracking-[0.08em] uppercase">
                                Shop By Category
                            </h2>
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
                                        <img
                                            src={imageFor(
                                                category.image_url,
                                                index,
                                            )}
                                            alt={`${category.name} collection`}
                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.035]"
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
                            activeCategory
                                ? `${activeCategory.name} Products`
                                : 'New In'
                        }
                        products={newInProducts.data}
                    />
                    <ProductPagination
                        pagination={newInProducts}
                        categorySlug={activeCategory?.slug}
                    />
                    <ProductRail
                        id="best-sellers"
                        title="Best Sellers"
                        products={bestSellerProducts}
                        featuredBadges
                    />

                    <section className="relative min-h-[195px] overflow-hidden bg-[#d8d3ca]">
                        <img
                            src={bottomBanner?.image_url ?? bannerImage}
                            alt="Doren spring summer tailoring"
                            className="absolute inset-0 h-full w-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-linear-to-r from-[#e8e0d4] via-[#e8e0d4]/70 to-transparent" />
                        <div className="relative mx-auto flex min-h-[195px] max-w-[1158px] items-center px-10">
                            <div className="max-w-[360px]">
                                <p className="text-[10px] font-bold tracking-[0.18em] text-[#8d6b35] uppercase">
                                    {bottomBanner?.eyebrow ??
                                        'Spring / Summer 2026'}
                                </p>
                                <h2 className="mt-3 [font-family:Georgia,_serif] text-[33px] leading-[1.02] font-medium">
                                    {bottomTitleLines.map((line) => (
                                        <span key={line} className="block">
                                            {line}
                                        </span>
                                    ))}
                                </h2>
                                <p className="mt-4 text-[12px] leading-5 text-[#3f3a33]">
                                    {bottomBanner?.body ??
                                        'Versatile pieces. Timeless appeal. Designed for wherever life takes you.'}
                                </p>
                                {(bottomBanner?.primary_action_label ??
                                    'Explore The Collection') && (
                                    <a
                                        href={
                                            bottomBanner?.primary_action_url ??
                                            '#new-in'
                                        }
                                        className="mt-4 inline-flex h-9 items-center bg-[#11110f] px-5 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
                                    >
                                        {bottomBanner?.primary_action_label ??
                                            'Explore The Collection'}
                                    </a>
                                )}
                            </div>
                        </div>
                    </section>

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
                            Subscribe for early access to new arrivals,
                            exclusive offers and style inspiration.
                        </p>
                        <form className="mx-auto mt-4 flex max-w-[430px] gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email address"
                                className="h-8 min-w-0 flex-1 border border-[#d6cec0] bg-white px-3 text-[11px] outline-none placeholder:text-[#8b857a]"
                            />
                            <button
                                type="submit"
                                className="h-8 bg-[#11110f] px-8 text-[10px] font-bold tracking-[0.12em] text-white uppercase"
                            >
                                Subscribe
                            </button>
                        </form>
                    </section>
                </main>

                <footer className="bg-[#11191b] text-[#f4f1ea]">
                    <div className="mx-auto grid max-w-[1158px] grid-cols-1 gap-9 px-6 py-8 md:grid-cols-[1.35fr_repeat(4,1fr)]">
                        <div>
                            <p className="[font-family:Georgia,_serif] text-[31px] leading-none tracking-[0.04em]">
                                DOREN
                            </p>
                            <p className="mt-4 max-w-[210px] text-[11px] leading-5 text-[#c9c5bb]">
                                Timeless menswear designed for the modern man.
                                Quality. Simplicity. Versatility.
                            </p>
                            <div className="mt-5 flex gap-5 text-[#c9c5bb]">
                                <Instagram className="h-4 w-4" />
                                <Youtube className="h-4 w-4" />
                                <Mail className="h-4 w-4" />
                            </div>
                        </div>

                        {footerColumns.map(([title, ...links]) => (
                            <div key={title}>
                                <h3 className="text-[10px] font-bold tracking-[0.12em] uppercase">
                                    {title}
                                </h3>
                                <ul className="mt-3 grid gap-1 text-[11px] leading-5 text-[#c9c5bb]">
                                    {links.map((item) => (
                                        <li key={item}>
                                            <a href="#newsletter">{item}</a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div className="mx-auto flex max-w-[1158px] flex-col gap-4 border-t border-white/10 px-6 py-4 text-[10px] text-[#c9c5bb] sm:flex-row sm:items-center sm:justify-between">
                        <span>© 2026 DOREN. All rights reserved.</span>
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
