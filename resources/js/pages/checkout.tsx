import { Head, Link, useForm, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    LockKeyhole,
    Mail,
    Search,
    ShoppingBag,
    User,
} from 'lucide-react';
import type { FormEvent } from 'react';

import { cart as cartRoute, home, login } from '@/routes';
import { store as storeCheckout } from '@/routes/checkout';
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

type CheckoutForm = {
    customer_first_name: string;
    customer_last_name: string;
    customer_email: string;
    customer_phone: string;
    shipping_street_address: string;
    shipping_address_line_two: string;
    shipping_city: string;
    shipping_postal_code: string;
    shipping_country_code: string;
    customer_note: string;
};

const fallbackImage =
    'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85';

function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(cents / 100);
}

function fieldLabel(value: string): string {
    return value
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

export default function Checkout({ items, subtotal_cents, currency }: Props) {
    const { cart, errors } = usePage().props;
    const pageErrors = errors as Record<string, string | undefined>;
    const form = useForm<CheckoutForm>({
        customer_first_name: '',
        customer_last_name: '',
        customer_email: '',
        customer_phone: '',
        shipping_street_address: '',
        shipping_address_line_two: '',
        shipping_city: '',
        shipping_postal_code: '',
        shipping_country_code: 'US',
        customer_note: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        form.post(storeCheckout.url(), {
            preserveScroll: true,
        });
    };

    const inputClass =
        'h-11 w-full border border-[#d6cec0] bg-[#f8f4ed] px-3 text-[13px] outline-none focus:border-[#151513]';
    const labelClass =
        'text-[10px] font-bold tracking-[0.1em] text-[#5d554b] uppercase';

    return (
        <>
            <Head title="Checkout | Doren" />

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
                    <Link
                        href={cartRoute()}
                        className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.08em] text-[#5d554b] uppercase"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back To Cart
                    </Link>

                    <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_390px]">
                        <form
                            onSubmit={submit}
                            className="border border-[#d6cec0] bg-[#f8f4ed] p-5"
                        >
                            <h1 className="[font-family:Georgia,_serif] text-[38px] leading-none font-medium tracking-normal">
                                Checkout
                            </h1>
                            {pageErrors.cart && (
                                <p className="mt-5 border border-red-200 bg-red-50 px-3 py-2 text-[12px] text-red-700">
                                    {pageErrors.cart}
                                </p>
                            )}

                            <section className="mt-7">
                                <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase">
                                    Contact
                                </h2>
                                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                                    {[
                                        'customer_first_name',
                                        'customer_last_name',
                                        'customer_email',
                                        'customer_phone',
                                    ].map((field) => (
                                        <label
                                            key={field}
                                            className="grid gap-2"
                                        >
                                            <span className={labelClass}>
                                                {fieldLabel(field)}
                                            </span>
                                            <input
                                                className={inputClass}
                                                type={
                                                    field === 'customer_email'
                                                        ? 'email'
                                                        : 'text'
                                                }
                                                value={
                                                    form.data[
                                                        field as keyof CheckoutForm
                                                    ]
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        field as keyof CheckoutForm,
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors[
                                                field as keyof CheckoutForm
                                            ] && (
                                                <span className="text-[12px] text-red-700">
                                                    {
                                                        form.errors[
                                                            field as keyof CheckoutForm
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                </div>
                            </section>

                            <section className="mt-8 border-t border-[#d6cec0] pt-7">
                                <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase">
                                    Shipping
                                </h2>
                                <div className="mt-4 grid gap-4">
                                    {[
                                        'shipping_street_address',
                                        'shipping_address_line_two',
                                    ].map((field) => (
                                        <label
                                            key={field}
                                            className="grid gap-2"
                                        >
                                            <span className={labelClass}>
                                                {fieldLabel(field)}
                                            </span>
                                            <input
                                                className={inputClass}
                                                value={
                                                    form.data[
                                                        field as keyof CheckoutForm
                                                    ]
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        field as keyof CheckoutForm,
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            {form.errors[
                                                field as keyof CheckoutForm
                                            ] && (
                                                <span className="text-[12px] text-red-700">
                                                    {
                                                        form.errors[
                                                            field as keyof CheckoutForm
                                                        ]
                                                    }
                                                </span>
                                            )}
                                        </label>
                                    ))}
                                    <div className="grid gap-4 sm:grid-cols-[1fr_140px_100px]">
                                        {[
                                            'shipping_city',
                                            'shipping_postal_code',
                                            'shipping_country_code',
                                        ].map((field) => (
                                            <label
                                                key={field}
                                                className="grid gap-2"
                                            >
                                                <span className={labelClass}>
                                                    {fieldLabel(field)}
                                                </span>
                                                <input
                                                    className={inputClass}
                                                    maxLength={
                                                        field ===
                                                        'shipping_country_code'
                                                            ? 2
                                                            : undefined
                                                    }
                                                    value={
                                                        form.data[
                                                            field as keyof CheckoutForm
                                                        ]
                                                    }
                                                    onChange={(event) =>
                                                        form.setData(
                                                            field as keyof CheckoutForm,
                                                            event.target.value,
                                                        )
                                                    }
                                                />
                                                {form.errors[
                                                    field as keyof CheckoutForm
                                                ] && (
                                                    <span className="text-[12px] text-red-700">
                                                        {
                                                            form.errors[
                                                                field as keyof CheckoutForm
                                                            ]
                                                        }
                                                    </span>
                                                )}
                                            </label>
                                        ))}
                                    </div>
                                    <label className="grid gap-2">
                                        <span className={labelClass}>
                                            Customer Note
                                        </span>
                                        <textarea
                                            className="min-h-28 w-full resize-y border border-[#d6cec0] bg-[#f8f4ed] px-3 py-3 text-[13px] outline-none focus:border-[#151513]"
                                            value={form.data.customer_note}
                                            onChange={(event) =>
                                                form.setData(
                                                    'customer_note',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        {form.errors.customer_note && (
                                            <span className="text-[12px] text-red-700">
                                                {form.errors.customer_note}
                                            </span>
                                        )}
                                    </label>
                                </div>
                            </section>

                            <button
                                type="submit"
                                disabled={form.processing || items.length === 0}
                                className="mt-7 inline-flex h-12 w-full items-center justify-center gap-3 bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase disabled:cursor-not-allowed disabled:bg-[#8f887d]"
                            >
                                <LockKeyhole className="h-4 w-4" />
                                {form.processing
                                    ? 'Placing Order...'
                                    : 'Place Order'}
                            </button>
                        </form>

                        <aside className="h-fit border border-[#d6cec0] bg-[#f8f4ed] p-5">
                            <h2 className="text-[13px] font-bold tracking-[0.1em] uppercase">
                                Order Summary
                            </h2>
                            {items.length === 0 ? (
                                <div className="mt-5 border-y border-[#d6cec0] py-8 text-center">
                                    <ShoppingBag className="mx-auto h-8 w-8 stroke-[1.3]" />
                                    <p className="mt-3 text-[13px] text-[#5d554b]">
                                        Your cart is empty.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-5 divide-y divide-[#d6cec0] border-y border-[#d6cec0]">
                                    {items.map((item) => (
                                        <div
                                            key={item.variant_id}
                                            className="grid grid-cols-[72px_1fr] gap-3 py-4"
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
                                                    href={showProduct(
                                                        item.slug,
                                                    )}
                                                    className="block truncate text-[13px] font-semibold"
                                                >
                                                    {item.name}
                                                </Link>
                                                <p className="mt-1 text-[11px] text-[#5d554b]">
                                                    {item.color_name} /{' '}
                                                    {item.size} / Qty{' '}
                                                    {item.quantity}
                                                </p>
                                                <p className="mt-2 text-[12px] font-semibold">
                                                    {formatPrice(
                                                        item.line_total_cents,
                                                        item.currency,
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <div className="mt-5 grid gap-4 text-[13px]">
                                <div className="flex justify-between gap-4">
                                    <span>Subtotal</span>
                                    <span className="font-semibold">
                                        {formatPrice(subtotal_cents, currency)}
                                    </span>
                                </div>
                                <div className="flex justify-between gap-4 text-[#5d554b]">
                                    <span>Shipping</span>
                                    <span>Calculated later</span>
                                </div>
                                <div className="flex justify-between gap-4 border-t border-[#d6cec0] pt-4 text-[16px] font-semibold">
                                    <span>Total</span>
                                    <span>
                                        {formatPrice(subtotal_cents, currency)}
                                    </span>
                                </div>
                            </div>
                        </aside>
                    </div>
                </main>

                <footer className="border-t border-[#d6cec0] bg-[#f8f4ed]">
                    <div className="mx-auto flex max-w-[1158px] flex-col gap-3 px-6 py-5 text-[11px] text-[#5d554b] sm:flex-row sm:items-center sm:justify-between">
                        <span>DOREN</span>
                        <span className="inline-flex items-center gap-2">
                            <Mail className="h-3.5 w-3.5" />
                            Customer care
                        </span>
                    </div>
                </footer>
            </div>
        </>
    );
}
