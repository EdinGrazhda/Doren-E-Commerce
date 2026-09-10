import { Head, useHttp } from '@inertiajs/react';
import { CalendarRange, Edit, Plus, Tag, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';

import { AdminApiState } from '@/components/admin-api-state';
import { AdminPagination } from '@/components/admin-pagination';
import type { AdminPaginationMeta } from '@/components/admin-pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
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
import { Textarea } from '@/components/ui/textarea';
import { useAdminApi } from '@/hooks/use-admin-api';
import { dashboard } from '@/routes';
import { destroy, index, store, update } from '@/routes/api/admin/campaigns';
import { index as campaignPage } from '@/routes/dashboard/campaigns';

type Product = {
    id: number;
    name: string;
    price_cents: number;
    currency: string;
    primary_image_url: string | null;
};

type Campaign = {
    id: number;
    name: string;
    description: string | null;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    starts_at: string | null;
    ends_at: string | null;
    is_active: boolean;
    products_count: number;
    products: Product[];
};

type CampaignData = {
    campaigns: AdminPaginationMeta<Campaign>;
    products: Product[];
};

type CampaignForm = {
    name: string;
    description: string;
    discount_type: 'percentage' | 'fixed';
    discount_value: number;
    starts_at: string;
    ends_at: string;
    is_active: boolean;
    product_ids: number[];
};

const emptyForm: CampaignForm = {
    name: '',
    description: '',
    discount_type: 'percentage',
    discount_value: 10,
    starts_at: '',
    ends_at: '',
    is_active: true,
    product_ids: [],
};

function dateInput(value: string | null): string {
    return value ? new Date(value).toISOString().slice(0, 16) : '';
}

function campaignStatus(campaign: Campaign): string {
    if (!campaign.is_active) {
        return 'Inactive';
    }

    const now = Date.now();

    if (campaign.starts_at && new Date(campaign.starts_at).getTime() > now) {
        return 'Scheduled';
    }

    if (campaign.ends_at && new Date(campaign.ends_at).getTime() < now) {
        return 'Ended';
    }

    return 'Active';
}

export default function AdminCampaignsIndex() {
    const [listingUrl, setListingUrl] = useState(index.url());
    const listing = useAdminApi<CampaignData>(listingUrl);
    const form = useHttp<CampaignForm>(emptyForm);
    const [open, setOpen] = useState(false);
    const [editing, setEditing] = useState<Campaign | null>(null);

    const openCreate = () => {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setOpen(true);
    };

    const openEdit = (campaign: Campaign) => {
        setEditing(campaign);
        form.setData({
            name: campaign.name,
            description: campaign.description ?? '',
            discount_type: campaign.discount_type,
            discount_value:
                campaign.discount_type === 'fixed'
                    ? campaign.discount_value / 100
                    : campaign.discount_value,
            starts_at: dateInput(campaign.starts_at),
            ends_at: dateInput(campaign.ends_at),
            is_active: campaign.is_active,
            product_ids: campaign.products.map((product) => product.id),
        });
        form.clearErrors();
        setOpen(true);
    };

    const toggleProduct = (productId: number, checked: boolean) => {
        form.setData(
            'product_ids',
            checked
                ? [...form.data.product_ids, productId]
                : form.data.product_ids.filter((id) => id !== productId),
        );
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const originalValue = form.data.discount_value;
        const payloadValue =
            form.data.discount_type === 'fixed'
                ? Math.round(originalValue * 100)
                : originalValue;
        form.transform(
            (data) =>
                ({
                    ...data,
                    discount_value: payloadValue,
                    starts_at: data.starts_at || null,
                    ends_at: data.ends_at || null,
                }) as unknown as CampaignForm,
        );

        const options = {
            onSuccess: () => {
                toast.success(
                    editing ? 'Campaign updated' : 'Campaign created',
                );
                setOpen(false);
                void listing.reload();
            },
            onFinish: () => {
                form.transform((data) => data);
                form.setData('discount_value', originalValue);
            },
        };

        if (editing) {
            void form.put(update.url(editing.id), options);
        } else {
            void form.post(store.url(), options);
        }
    };

    const remove = (campaign: Campaign) => {
        if (!window.confirm(`Delete “${campaign.name}”?`)) {
            return;
        }

        void form.delete(destroy.url(campaign.id), {
            onSuccess: () => {
                toast.success('Campaign deleted');
                void listing.reload();
            },
        });
    };

    if (!listing.data) {
        return (
            <>
                <Head title="Product Campaigns" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { campaigns, products } = listing.data;

    return (
        <>
            <Head title="Product Campaigns" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Product campaigns
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Schedule automatic discounts across one or many
                            products.
                        </p>
                    </div>
                    <Button onClick={openCreate}>
                        <Plus />
                        New campaign
                    </Button>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                    <Card>
                        <CardContent className="flex items-center gap-3 p-5">
                            <Tag className="size-5" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {campaigns.total}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Campaigns
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-5">
                            <CalendarRange className="size-5" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {
                                        campaigns.data.filter(
                                            (item) =>
                                                campaignStatus(item) ===
                                                'Active',
                                        ).length
                                    }
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Active on this page
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="flex items-center gap-3 p-5">
                            <Tag className="size-5" />
                            <div>
                                <div className="text-2xl font-semibold">
                                    {products.length}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                    Available products
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Campaigns</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[820px] text-sm">
                                <thead>
                                    <tr className="border-b text-left text-xs text-muted-foreground">
                                        <th className="py-3 font-medium">
                                            Campaign
                                        </th>
                                        <th className="py-3 font-medium">
                                            Discount
                                        </th>
                                        <th className="py-3 font-medium">
                                            Products
                                        </th>
                                        <th className="py-3 font-medium">
                                            Schedule
                                        </th>
                                        <th className="py-3 font-medium">
                                            Status
                                        </th>
                                        <th className="py-3 text-right font-medium">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {campaigns.data.map((campaign) => (
                                        <tr
                                            key={campaign.id}
                                            className="border-b last:border-0"
                                        >
                                            <td className="py-3 pr-4">
                                                <div className="font-medium">
                                                    {campaign.name}
                                                </div>
                                                <div className="max-w-64 truncate text-xs text-muted-foreground">
                                                    {campaign.description ||
                                                        'No description'}
                                                </div>
                                            </td>
                                            <td className="py-3 font-medium">
                                                {campaign.discount_type ===
                                                'percentage'
                                                    ? `${campaign.discount_value}%`
                                                    : new Intl.NumberFormat(
                                                          'en-US',
                                                          {
                                                              style: 'currency',
                                                              currency: 'USD',
                                                          },
                                                      ).format(
                                                          campaign.discount_value /
                                                              100,
                                                      )}
                                            </td>
                                            <td className="py-3">
                                                {campaign.products_count}
                                            </td>
                                            <td className="py-3 text-xs">
                                                {campaign.starts_at
                                                    ? new Date(
                                                          campaign.starts_at,
                                                      ).toLocaleDateString()
                                                    : 'Immediately'}{' '}
                                                —{' '}
                                                {campaign.ends_at
                                                    ? new Date(
                                                          campaign.ends_at,
                                                      ).toLocaleDateString()
                                                    : 'No end'}
                                            </td>
                                            <td className="py-3">
                                                <Badge
                                                    variant={
                                                        campaignStatus(
                                                            campaign,
                                                        ) === 'Active'
                                                            ? 'default'
                                                            : 'secondary'
                                                    }
                                                >
                                                    {campaignStatus(campaign)}
                                                </Badge>
                                            </td>
                                            <td className="py-3">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() =>
                                                            openEdit(campaign)
                                                        }
                                                    >
                                                        <Edit />
                                                        Edit
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() =>
                                                            remove(campaign)
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
                        </div>
                        <AdminPagination
                            pagination={campaigns}
                            onPageChange={setListingUrl}
                        />
                    </CardContent>
                </Card>
            </div>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            {editing ? 'Edit campaign' : 'Create campaign'}
                        </DialogTitle>
                    </DialogHeader>
                    <form className="grid gap-5" onSubmit={submit}>
                        <div className="grid gap-2">
                            <Label htmlFor="campaign-name">Name</Label>
                            <Input
                                id="campaign-name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                            />
                            {form.errors.name && (
                                <p className="text-sm text-destructive">
                                    {form.errors.name}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="campaign-description">
                                Description
                            </Label>
                            <Textarea
                                id="campaign-description"
                                value={form.data.description}
                                onChange={(event) =>
                                    form.setData(
                                        'description',
                                        event.target.value,
                                    )
                                }
                            />
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label>Discount type</Label>
                                <Select
                                    value={form.data.discount_type}
                                    onValueChange={(
                                        value: 'percentage' | 'fixed',
                                    ) => form.setData('discount_type', value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="percentage">
                                            Percentage
                                        </SelectItem>
                                        <SelectItem value="fixed">
                                            Fixed amount
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="campaign-value">
                                    {form.data.discount_type === 'percentage'
                                        ? 'Percentage'
                                        : 'Amount (USD)'}
                                </Label>
                                <Input
                                    id="campaign-value"
                                    type="number"
                                    min="1"
                                    max={
                                        form.data.discount_type === 'percentage'
                                            ? 100
                                            : undefined
                                    }
                                    step={
                                        form.data.discount_type === 'fixed'
                                            ? '0.01'
                                            : '1'
                                    }
                                    value={form.data.discount_value}
                                    onChange={(event) =>
                                        form.setData(
                                            'discount_value',
                                            Number(event.target.value),
                                        )
                                    }
                                />
                                {form.errors.discount_value && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.discount_value}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="grid gap-2">
                                <Label htmlFor="campaign-start">Starts</Label>
                                <Input
                                    id="campaign-start"
                                    type="datetime-local"
                                    value={form.data.starts_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'starts_at',
                                            event.target.value,
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="campaign-end">Ends</Label>
                                <Input
                                    id="campaign-end"
                                    type="datetime-local"
                                    value={form.data.ends_at}
                                    onChange={(event) =>
                                        form.setData(
                                            'ends_at',
                                            event.target.value,
                                        )
                                    }
                                />
                                {form.errors.ends_at && (
                                    <p className="text-sm text-destructive">
                                        {form.errors.ends_at}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label>
                                Products ({form.data.product_ids.length}{' '}
                                selected)
                            </Label>
                            <div className="grid max-h-56 gap-1 overflow-y-auto rounded-md border p-2 sm:grid-cols-2">
                                {products.map((product) => (
                                    <label
                                        key={product.id}
                                        className="flex cursor-pointer items-center gap-3 rounded-md p-2 hover:bg-muted"
                                    >
                                        <Checkbox
                                            checked={form.data.product_ids.includes(
                                                product.id,
                                            )}
                                            onCheckedChange={(checked) =>
                                                toggleProduct(
                                                    product.id,
                                                    checked === true,
                                                )
                                            }
                                        />
                                        <span className="truncate text-sm">
                                            {product.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {form.errors.product_ids && (
                                <p className="text-sm text-destructive">
                                    {form.errors.product_ids}
                                </p>
                            )}
                        </div>
                        <label className="flex items-center gap-3 text-sm font-medium">
                            <Checkbox
                                checked={form.data.is_active}
                                onCheckedChange={(checked) =>
                                    form.setData('is_active', checked === true)
                                }
                            />
                            Active campaign
                        </label>
                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={form.processing}>
                                {editing ? 'Save changes' : 'Create campaign'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

AdminCampaignsIndex.layout = {
    breadcrumbs: [
        { title: 'Admin', href: dashboard() },
        { title: 'Campaigns', href: campaignPage() },
    ],
};
