import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Check, ShoppingBag } from 'lucide-react';

import { home } from '@/routes';

type Order = {
    order_number: string;
    customer_email: string;
    total_cents: number;
    currency: string;
};

type Props = {
    order: Order;
};

function formatPrice(cents: number, currency: string): string {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency || 'USD',
    }).format(cents / 100);
}

export default function ThankYou({ order }: Props) {
    return (
        <>
            <Head title="Order Placed | Doren" />

            <div className="min-h-screen bg-[#f5f1e9] text-[#151513] antialiased">
                <div className="bg-[#12110f] px-4 py-2 text-center text-[12px] leading-none text-[#f6f1e9]">
                    Complimentary shipping on orders over $150
                </div>

                <main className="mx-auto grid min-h-[calc(100vh-28px)] max-w-[760px] place-items-center px-6 py-12">
                    <section className="w-full border border-[#d6cec0] bg-[#f8f4ed] p-7 text-center">
                        <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-[#151513] text-white">
                            <Check className="h-6 w-6" />
                        </div>
                        <p className="mt-6 text-[11px] font-bold tracking-[0.12em] text-[#5d554b] uppercase">
                            Order {order.order_number}
                        </p>
                        <h1 className="mt-3 [font-family:Georgia,_serif] text-[42px] leading-none font-medium tracking-normal">
                            Thank You
                        </h1>
                        <p className="mx-auto mt-5 max-w-[440px] text-[14px] leading-6 text-[#5d554b]">
                            We received your order and saved it in the
                            dashboard. Confirmation details can be sent to{' '}
                            {order.customer_email}.
                        </p>
                        <div className="mx-auto mt-7 grid max-w-[360px] gap-3 border-y border-[#d6cec0] py-5 text-[13px]">
                            <div className="flex justify-between gap-4">
                                <span>Total</span>
                                <span className="font-semibold">
                                    {formatPrice(
                                        order.total_cents,
                                        order.currency,
                                    )}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={home()}
                            className="mt-7 inline-flex h-11 items-center gap-3 bg-[#11110f] px-6 text-[11px] font-bold tracking-[0.12em] text-white uppercase"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Continue Shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </section>
                </main>
            </div>
        </>
    );
}
