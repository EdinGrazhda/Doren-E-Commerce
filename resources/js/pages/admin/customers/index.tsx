import { Head } from '@inertiajs/react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { formatDate, formatMoney } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/dashboard/customers';

type Customer = {
    customer_email: string;
    first_name: string;
    last_name: string;
    orders_count: number;
    total_spent_cents: number;
    last_order_at: string;
};

type Props = {
    customers: Customer[];
};

export default function AdminCustomersIndex({ customers }: Props) {
    return (
        <>
            <Head title="Admin Customers" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Customers
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Guest customer history aggregated from orders.
                        </p>
                    </div>
                    <Input
                        className="max-w-xs"
                        placeholder="Search customers"
                    />
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            {customers.length.toLocaleString()} recent customers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-sm">
                            <thead>
                                <tr className="border-b text-left text-xs text-muted-foreground">
                                    <th className="py-3 font-medium">
                                        Customer
                                    </th>
                                    <th className="py-3 font-medium">Email</th>
                                    <th className="py-3 font-medium">Orders</th>
                                    <th className="py-3 font-medium">
                                        Last order
                                    </th>
                                    <th className="py-3 text-right font-medium">
                                        Total spent
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {customers.map((customer) => (
                                    <tr
                                        key={customer.customer_email}
                                        className="border-b last:border-0"
                                    >
                                        <td className="py-3 font-medium">
                                            {customer.first_name}{' '}
                                            {customer.last_name}
                                        </td>
                                        <td className="py-3">
                                            {customer.customer_email}
                                        </td>
                                        <td className="py-3">
                                            {customer.orders_count}
                                        </td>
                                        <td className="py-3">
                                            {formatDate(customer.last_order_at)}
                                        </td>
                                        <td className="py-3 text-right font-medium">
                                            {formatMoney(
                                                customer.total_spent_cents,
                                            )}
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

AdminCustomersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Customers',
            href: customersIndex(),
        },
    ],
};
