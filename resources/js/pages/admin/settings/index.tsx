import { Head } from '@inertiajs/react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { dashboard } from '@/routes';
import { settings as adminSettings } from '@/routes/dashboard';

type Props = {
    settings: {
        store_name: string;
        currency: string;
        guest_checkout: boolean;
        admin_accounts: boolean;
    };
};

export default function AdminSettingsIndex({ settings }: Props) {
    return (
        <>
            <Head title="Admin Settings" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Store Settings
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        Operational defaults for the ecommerce store and admin
                        panel.
                    </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>General</CardTitle>
                            <CardDescription>
                                These values are read-only until settings
                                persistence is added.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="store-name">Store name</Label>
                                <Input
                                    id="store-name"
                                    value={settings.store_name}
                                    readOnly
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="currency">Currency</Label>
                                <Input
                                    id="currency"
                                    value={settings.currency}
                                    readOnly
                                />
                            </div>
                            <Separator />
                            <Button disabled>Save settings</Button>
                        </CardContent>
                    </Card>

                    <Card className="rounded-lg">
                        <CardHeader>
                            <CardTitle>Checkout</CardTitle>
                            <CardDescription>
                                Guest ordering is enabled for storefront
                                customers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">Guest checkout</span>
                                <Badge>
                                    {settings.guest_checkout
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between gap-4">
                                <span className="text-sm">Admin accounts</span>
                                <Badge>
                                    {settings.admin_accounts
                                        ? 'Enabled'
                                        : 'Disabled'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}

AdminSettingsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Settings',
            href: adminSettings(),
        },
    ],
};
