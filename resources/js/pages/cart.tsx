import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    ArrowRight,
    Instagram,
    Mail,
    Search,
    ShoppingBag,
    Trash2,
    User,
    Youtube,
} from 'lucide-react';

import { checkout, home, login } from '@/routes';
import { cart as cartRoute } from '@/routes';
import { destroy as destroyCartItem } from '@/routes/cart-items';
import { show as showProduct } from '@/routes/products';

type CartItem = {
    product_id: number;
    variant_id: number;
    name: string;
    slug: string;
    image_url: string | null;
    size: string;
    color_name: string;
    color_hex: string | null;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
    currency: string;
};

type Props = {
    items: CartItem[];
    subtotal_cents: number;
    currency: string;
};

const fallbackImage =
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85';

function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(cents / 100);
}

export default function Cart({ items, subtotal_cents, currency }: Props) {
    const { cart } = usePage().props;

    return (
        <>
            <Head title="Cart | Doren" />

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
                            {['New In', 'Polos', 'Knitwear', 'Shirts'].map(
                                (item) => (
                                    <Link key={item} href={home()}>
                                        {item}
                                    </Link>
                                ),
                            )}
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

                <main className="mx-auto max-w-[1158px] px-6 py-10">
                    <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[#d6cec0] pb-6">
                        <div>
                            <Link
                                href={home()}
                                className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] text-[#5d554b] uppercase"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Continue Shopping
                            </Link>
                            <h1 className="mt-5 [font-family:Georgia,_serif] text-[42px] leading-none font-medium tracking-normal">
                                Shopping Cart
                            </h1>
                        </div>
                        <p className="text-[12px] font-bold tracking-[0.1em] text-[#5d554b] uppercase">
                            {cart.count} {cart.count === 1 ? 'Item' : 'Items'}
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <section className="grid min-h-[360px] place-items-center border-b border-[#d6cec0] py-14 text-center">
                            <div>
                                <ShoppingBag className="mx-auto h-10 w-10 stroke-[1.3]" />
                                <h2 className="mt-5 text-[15px] font-bold tracking-[0.1em] uppercase">
                                    Your cart is empty
                                </h2>
                                <p className="mt-3 max-w-[360px] text-[13px] leading-6 text-[#5d554b]">
                                    Choose a product, select an available size,
                                    and add it to your cart.
                                </p>
                                <Link
                                    href={home()}
                                    className="mt-7 inline-flex h-11 items-center gap-3 bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase"
                                >
                                    Shop Collection
                                    <ArrowRight className="h-4 w-4" />
                                </Link>
                            </div>
                        </section>
                    ) : (
                        <section className="grid gap-8 py-7 lg:grid-cols-[1fr_360px]">
                            <div className="divide-y divide-[#d6cec0] border-y border-[#d6cec0]">
                                {items.map((item) => (
                                    <article
                                        key={item.variant_id}
                                        className="grid gap-4 py-5 sm:grid-cols-[116px_1fr_auto]"
                                    >
                                        <Link
                                            href={showProduct(item.slug)}
                                            className="aspect-[0.86] overflow-hidden bg-[#ded7cc]"
                                        >
                                            <img
                                                src={
                                                    item.image_url ??
                                                    fallbackImage
                                                }
                                                alt={item.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </Link>
                                        <div className="min-w-0">
                                            <Link
                                                href={showProduct(item.slug)}
                                                className="block truncate text-[15px] font-semibold"
                                            >
                                                {item.name}
                                            </Link>
                                            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[#5d554b]">
                                                <span>Size {item.size}</span>
                                                <span className="inline-flex items-center gap-2">
                                                    <span
                                                        className="h-3 w-3 rounded-full border border-black/15"
                                                        style={{
                                                            backgroundColor:
                                                                item.color_hex ??
                                                                '#d9cfbd',
                                                        }}
                                                    />
                                                    {item.color_name}
                                                </span>
                                                <span>Qty {item.quantity}</span>
                                            </div>
                                            <Link
                                                href={destroyCartItem(
                                                    item.variant_id,
                                                )}
                                                method="delete"
                                                as="button"
                                                preserveScroll
                                                className="mt-5 inline-flex h-8 items-center gap-2 border border-red-200 bg-red-50 px-3 text-[11px] font-bold tracking-[0.08em] text-red-700 uppercase transition hover:border-red-300 hover:bg-red-100 hover:text-red-800 focus:border-red-500 focus:outline-none"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                                Remove
                                            </Link>
                                        </div>
                                        <div className="text-left sm:text-right">
                                            <p className="text-[13px] font-semibold">
                                                {formatPrice(
                                                    item.line_total_cents,
                                                    item.currency,
                                                )}
                                            </p>
                                            <p className="mt-1 text-[11px] text-[#756e62]">
                                                {formatPrice(
                                                    item.unit_price_cents,
                                                    item.currency,
                                                )}{' '}
                                                each
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            <aside className="h-fit border border-[#d6cec0] bg-[#f8f4ed] p-5">
                                <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase">
                                    Order Summary
                                </h2>
                                <div className="mt-5 grid gap-4 border-y border-[#d6cec0] py-5 text-[13px]">
                                    <div className="flex justify-between gap-4">
                                        <span>Subtotal</span>
                                        <span className="font-semibold">
                                            {formatPrice(
                                                subtotal_cents,
                                                currency,
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between gap-4 text-[#5d554b]">
                                        <span>Shipping</span>
                                        <span>Calculated later</span>
                                    </div>
                                </div>
                                <div className="mt-5 flex justify-between gap-4 text-[16px] font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatPrice(subtotal_cents, currency)}
                                    </span>
                                </div>
                                <Link
                                    href={checkout()}
                                    className="mt-6 inline-flex h-12 w-full items-center justify-center bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase"
                                >
                                    Checkout
                                </Link>
                            </aside>
                        </section>
                    )}
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
                </footer>
            </div>
        </>
    );
}
