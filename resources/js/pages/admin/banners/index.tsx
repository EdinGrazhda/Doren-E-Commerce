import { Head, useHttp } from '@inertiajs/react';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';

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
import { Textarea } from '@/components/ui/textarea';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate } from '@/lib/admin-format';
import { dashboard } from '@/routes';
import {
    destroy as destroyBanner,
    index as bannersApiIndex,
    store as storeBanner,
    update as updateBanner,
} from '@/routes/api/admin/banners';
import { index as bannersIndex } from '@/routes/dashboard/banners';

type Banner = {
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
    is_active: boolean;
    sort_order: number;
    updated_at: string;
};

type Props = {
    banners: AdminPaginationMeta<Banner>;
    positions: string[];
};

type BannerFormData = {
    position: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    body: string;
    primary_action_label: string;
    primary_action_url: string;
    secondary_action_label: string;
    secondary_action_url: string;
    image_url: string;
    image_upload: File | null;
    is_active: boolean;
    sort_order: string;
};

const emptyBanner: BannerFormData = {
    position: 'hero',
    eyebrow: '',
    title: '',
    subtitle: '',
    body: '',
    primary_action_label: '',
    primary_action_url: '',
    secondary_action_label: '',
    secondary_action_url: '',
    image_url: '',
    image_upload: null,
    is_active: true,
    sort_order: '0',
};

const positionLabels: Record<string, string> = {
    top: 'Top announcement',
    hero: 'Main hero',
    bottom: 'Bottom campaign',
};

export default function AdminBannersIndex() {
    const [open, setOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [bannersPageUrl, setBannersPageUrl] = useState(bannersApiIndex.url());
    const listing = useAdminApi<Props>(bannersPageUrl);
    const form = useHttp<BannerFormData>(emptyBanner);
    const deleteRequest = useHttp<Record<string, never>>({});

    if (!listing.data) {
        return (
            <>
                <Head title="Admin Banners" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { banners, positions } = listing.data;

    const openCreateDialog = () => {
        setEditingBanner(null);
        form.clearErrors();
        form.setData(emptyBanner);
        setOpen(true);
    };

    const openEditDialog = (banner: Banner) => {
        setEditingBanner(banner);
        form.clearErrors();
        form.setData({
            position: banner.position,
            eyebrow: banner.eyebrow ?? '',
            title: banner.title ?? '',
            subtitle: banner.subtitle ?? '',
            body: banner.body ?? '',
            primary_action_label: banner.primary_action_label ?? '',
            primary_action_url: banner.primary_action_url ?? '',
            secondary_action_label: banner.secondary_action_label ?? '',
            secondary_action_url: banner.secondary_action_url ?? '',
            image_url: banner.image_url ?? '',
            image_upload: null,
            is_active: banner.is_active,
            sort_order: banner.sort_order.toString(),
        });
        setOpen(true);
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const options = {
            onSuccess: () => {
                setOpen(false);
                setEditingBanner(null);
                form.reset();
                void listing.reload();
            },
        };

        if (editingBanner) {
            form.transform((data) => ({
                ...data,
                _method: 'put',
            }));
            void form.post(updateBanner.url(editingBanner.id), options);

            return;
        }

        form.transform((data) => data);
        void form.post(storeBanner.url(), options);
    };

    const deleteBanner = (banner: Banner) => {
        if (
            !window.confirm(
                `Delete ${banner.title || positionLabels[banner.position]}?`,
            )
        ) {
            return;
        }

        void deleteRequest
            .delete(destroyBanner.url(banner.id), {
                onSuccess: () => void listing.reload(),
            })
            .catch(() => undefined);
    };

    return (
        <>
            <Head title="Admin Banners" />

            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Banners
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Manage the top announcement, hero, and bottom
                            storefront campaign.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>
                                <Plus />
                                New banner
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingBanner
                                        ? 'Edit banner'
                                        : 'New banner'}
                                </DialogTitle>
                                <DialogDescription>
                                    Content here appears on the ecommerce
                                    homepage.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid gap-4" onSubmit={submit}>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label>Position</Label>
                                        <Select
                                            value={form.data.position}
                                            onValueChange={(value) =>
                                                form.setData('position', value)
                                            }
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select position" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {positions.map((position) => (
                                                    <SelectItem
                                                        key={position}
                                                        value={position}
                                                    >
                                                        {positionLabels[
                                                            position
                                                        ] ?? position}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {form.errors.position && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.position}
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-sort-order">
                                            Order
                                        </Label>
                                        <Input
                                            id="banner-sort-order"
                                            type="number"
                                            min="0"
                                            value={form.data.sort_order}
                                            onChange={(event) =>
                                                form.setData(
                                                    'sort_order',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        {form.errors.sort_order && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.sort_order}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-eyebrow">
                                        Eyebrow
                                    </Label>
                                    <Input
                                        id="banner-eyebrow"
                                        value={form.data.eyebrow}
                                        onChange={(event) =>
                                            form.setData(
                                                'eyebrow',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Spring / Summer 2026"
                                    />
                                    {form.errors.eyebrow && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.eyebrow}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-title">Title</Label>
                                    <Input
                                        id="banner-title"
                                        value={form.data.title}
                                        onChange={(event) =>
                                            form.setData(
                                                'title',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Timeless style. Modern man."
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.title}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-subtitle">
                                        Subtitle
                                    </Label>
                                    <Textarea
                                        id="banner-subtitle"
                                        value={form.data.subtitle}
                                        onChange={(event) =>
                                            form.setData(
                                                'subtitle',
                                                event.target.value,
                                            )
                                        }
                                    />
                                    {form.errors.subtitle && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.subtitle}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-body">Body</Label>
                                    <Textarea
                                        id="banner-body"
                                        value={form.data.body}
                                        onChange={(event) =>
                                            form.setData(
                                                'body',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Announcement or campaign body text"
                                    />
                                    {form.errors.body && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.body}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-primary-label">
                                            Primary button
                                        </Label>
                                        <Input
                                            id="banner-primary-label"
                                            value={
                                                form.data.primary_action_label
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'primary_action_label',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Shop Collection"
                                        />
                                        {form.errors.primary_action_label && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    form.errors
                                                        .primary_action_label
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-primary-url">
                                            Primary URL
                                        </Label>
                                        <Input
                                            id="banner-primary-url"
                                            value={form.data.primary_action_url}
                                            onChange={(event) =>
                                                form.setData(
                                                    'primary_action_url',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="#new-in"
                                        />
                                        {form.errors.primary_action_url && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.primary_action_url}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-secondary-label">
                                            Secondary button
                                        </Label>
                                        <Input
                                            id="banner-secondary-label"
                                            value={
                                                form.data.secondary_action_label
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'secondary_action_label',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="Explore"
                                        />
                                        {form.errors.secondary_action_label && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    form.errors
                                                        .secondary_action_label
                                                }
                                            </p>
                                        )}
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-secondary-url">
                                            Secondary URL
                                        </Label>
                                        <Input
                                            id="banner-secondary-url"
                                            value={
                                                form.data.secondary_action_url
                                            }
                                            onChange={(event) =>
                                                form.setData(
                                                    'secondary_action_url',
                                                    event.target.value,
                                                )
                                            }
                                            placeholder="#shop-by-category"
                                        />
                                        {form.errors.secondary_action_url && (
                                            <p className="text-sm text-destructive">
                                                {
                                                    form.errors
                                                        .secondary_action_url
                                                }
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-image-url">
                                        Image URL
                                    </Label>
                                    <Input
                                        id="banner-image-url"
                                        value={form.data.image_url}
                                        onChange={(event) =>
                                            form.setData(
                                                'image_url',
                                                event.target.value,
                                            )
                                        }
                                        placeholder="https://..."
                                    />
                                    {form.errors.image_url && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.image_url}
                                        </p>
                                    )}
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-image-upload">
                                        Upload image
                                    </Label>
                                    <Input
                                        id="banner-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(event) =>
                                            form.setData(
                                                'image_upload',
                                                event.target.files?.[0] ?? null,
                                            )
                                        }
                                    />
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
                                    {form.errors.image_upload && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.image_upload}
                                        </p>
                                    )}
                                </div>

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
                                    Active on storefront
                                </label>

                                <DialogFooter>
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
                                        {editingBanner ? 'Save' : 'Create'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            {banners.total.toLocaleString()} banners
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {banners.data.map((banner) => (
                            <div
                                key={banner.id}
                                className="grid gap-4 rounded-lg border p-4 md:grid-cols-[160px_1fr_auto]"
                            >
                                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                                    {banner.image_url ? (
                                        <img
                                            src={banner.image_url}
                                            alt={
                                                banner.title ||
                                                positionLabels[
                                                    banner.position
                                                ] ||
                                                'Banner'
                                            }
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center text-muted-foreground">
                                            <Image className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">
                                            {positionLabels[banner.position] ??
                                                banner.position}
                                        </Badge>
                                        <Badge
                                            variant={
                                                banner.is_active
                                                    ? 'default'
                                                    : 'outline'
                                            }
                                        >
                                            {banner.is_active
                                                ? 'Active'
                                                : 'Inactive'}
                                        </Badge>
                                        <span className="text-xs text-muted-foreground">
                                            Order {banner.sort_order}
                                        </span>
                                    </div>
                                    <h2 className="mt-3 truncate text-base font-semibold">
                                        {banner.title ||
                                            banner.body ||
                                            'Untitled banner'}
                                    </h2>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {banner.subtitle ||
                                            banner.body ||
                                            'No supporting copy'}
                                    </p>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Updated {formatDate(banner.updated_at)}
                                    </p>
                                </div>

                                <div className="flex items-start justify-end gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => openEditDialog(banner)}
                                    >
                                        <Edit />
                                        Edit
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => deleteBanner(banner)}
                                    >
                                        <Trash2 />
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <AdminPagination
                            pagination={banners}
                            onPageChange={setBannersPageUrl}
                        />
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

AdminBannersIndex.layout = {
    breadcrumbs: [
        {
            title: 'Admin',
            href: dashboard(),
        },
        {
            title: 'Banners',
            href: bannersIndex(),
        },
    ],
};
