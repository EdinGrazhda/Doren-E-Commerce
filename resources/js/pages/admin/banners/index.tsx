import { Head, useHttp } from '@inertiajs/react';
import { Edit, Image, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { AdminPagination } from '@/components/admin-pagination';
import type { AdminPaginationMeta } from '@/components/admin-pagination';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    position: 'hero' | 'bottom';
    eyebrow: string | null;
    title: string | null;
    subtitle: string | null;
    body: string | null;
    primary_action_label: string | null;
    primary_action_url: string | null;
    image_url: string | null;
    updated_at: string;
};

type Props = {
    banners: AdminPaginationMeta<Banner>;
    bottomBanner: Banner | null;
};

type BannerFormData = {
    position: 'hero' | 'bottom';
    eyebrow: string;
    title: string;
    subtitle: string;
    body: string;
    primary_action_label: string;
    primary_action_url: string;
    image_upload: File | null;
};

const emptyBanner: BannerFormData = {
    position: 'hero',
    eyebrow: '',
    title: '',
    subtitle: '',
    body: '',
    primary_action_label: '',
    primary_action_url: '',
    image_upload: null,
};

const bannerUploadMaxBytes = 1.8 * 1024 * 1024;
const bannerUploadMaxWidth = 2400;
const bannerUploadMaxHeight = 1200;
const bannerUploadMinWidth = 1200;
const bannerUploadMinQuality = 0.72;
const bannerUploadQualityStep = 0.08;
const bannerUploadTypes = ['image/jpeg', 'image/png', 'image/webp'];

function bannerFileExtension(file: File): string {
    if (file.type === 'image/png') {
        return 'png';
    }

    if (file.type === 'image/webp') {
        return 'webp';
    }

    return 'jpg';
}

function lowerCaseBannerFileName(file: File, extension: string): string {
    const baseName = file.name
        .replace(/\.[^.]+$/, '')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();

    return `${baseName || 'hero-banner'}.${extension}`;
}

function imageFromFile(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const image = document.createElement('img');
        const objectUrl = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(objectUrl);
            resolve(image);
        };
        image.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            reject(new Error('The selected image could not be opened.'));
        };
        image.src = objectUrl;
    });
}

function canvasBlob(
    canvas: HTMLCanvasElement,
    type: string,
    quality: number,
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    reject(
                        new Error('The selected image could not be prepared.'),
                    );

                    return;
                }

                resolve(blob);
            },
            type,
            quality,
        );
    });
}

function drawBannerImage(
    canvas: HTMLCanvasElement,
    image: HTMLImageElement,
    width: number,
    height: number,
): CanvasRenderingContext2D | null {
    const context = canvas.getContext('2d');

    if (!context) {
        return null;
    }

    canvas.width = width;
    canvas.height = height;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return context;
}

async function preparedBannerUpload(file: File): Promise<File> {
    if (!bannerUploadTypes.includes(file.type)) {
        return file;
    }

    if (file.size <= bannerUploadMaxBytes) {
        return new File(
            [file],
            lowerCaseBannerFileName(file, bannerFileExtension(file)),
            {
                type: file.type,
            },
        );
    }

    const image = await imageFromFile(file);
    const scale = Math.min(
        1,
        bannerUploadMaxWidth / image.naturalWidth,
        bannerUploadMaxHeight / image.naturalHeight,
    );
    let width = Math.max(1, Math.round(image.naturalWidth * scale));
    let height = Math.max(1, Math.round(image.naturalHeight * scale));
    const canvas = document.createElement('canvas');

    if (!drawBannerImage(canvas, image, width, height)) {
        return new File([file], lowerCaseBannerFileName(file, 'jpg'), {
            type: file.type,
        });
    }

    let quality = 0.9;
    let blob = await canvasBlob(canvas, 'image/jpeg', quality);

    while (
        blob.size > bannerUploadMaxBytes &&
        quality > bannerUploadMinQuality
    ) {
        quality -= bannerUploadQualityStep;
        blob = await canvasBlob(canvas, 'image/jpeg', quality);
    }

    while (blob.size > bannerUploadMaxBytes && width > bannerUploadMinWidth) {
        width = Math.max(bannerUploadMinWidth, Math.round(width * 0.85));
        height = Math.max(1, Math.round(height * 0.85));
        quality = 0.86;
        drawBannerImage(canvas, image, width, height);
        blob = await canvasBlob(canvas, 'image/jpeg', quality);
    }

    return new File([blob], lowerCaseBannerFileName(file, 'jpg'), {
        type: 'image/jpeg',
    });
}

export default function AdminBannersIndex() {
    const [open, setOpen] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
    const [editingPosition, setEditingPosition] = useState<'hero' | 'bottom'>(
        'hero',
    );
    const [showPlacementSelector, setShowPlacementSelector] = useState(false);
    const [bannersPageUrl, setBannersPageUrl] = useState(bannersApiIndex.url());
    const [imagePreparationError, setImagePreparationError] = useState('');
    const [isPreparingImage, setIsPreparingImage] = useState(false);
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

    const { banners, bottomBanner } = listing.data;

    const openCreateDialog = () => {
        setEditingBanner(null);
        setEditingPosition('hero');
        setShowPlacementSelector(true);
        setImagePreparationError('');
        form.clearErrors();
        form.setData(emptyBanner);
        setOpen(true);
    };

    const fillFormFromBanner = (banner: Banner) => {
        setEditingBanner(banner);
        setEditingPosition(banner.position);
        setImagePreparationError('');
        form.clearErrors();
        form.setData({
            position: banner.position,
            eyebrow: banner.eyebrow ?? '',
            title: banner.title ?? '',
            subtitle: banner.subtitle ?? '',
            body: banner.body ?? '',
            primary_action_label: banner.primary_action_label ?? '',
            primary_action_url: banner.primary_action_url ?? '',
            image_upload: null,
        });
    };

    const openEditDialog = (banner: Banner) => {
        fillFormFromBanner(banner);
        setShowPlacementSelector(false);
        setOpen(true);
    };

    const choosePlacement = (position: 'hero' | 'bottom') => {
        if (position === 'bottom' && bottomBanner) {
            fillFormFromBanner(bottomBanner);

            return;
        }

        setEditingBanner(null);
        setEditingPosition(position);
        setImagePreparationError('');
        form.clearErrors();
        form.setData(
            position === 'bottom'
                ? {
                      ...emptyBanner,
                      position: 'bottom',
                      eyebrow: 'Spring / Summer 2026',
                      title: 'Elevated Essentials For Every Day',
                      body: 'Versatile pieces. Timeless appeal. Designed for wherever life takes you.',
                      primary_action_label: 'Explore The Collection',
                      primary_action_url: '#new-in',
                  }
                : emptyBanner,
        );
    };

    const openBottomDialog = () => {
        if (bottomBanner) {
            openEditDialog(bottomBanner);

            return;
        }

        choosePlacement('bottom');
        setShowPlacementSelector(false);
        setOpen(true);
    };

    const changeBannerImage = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] ?? null;

        setImagePreparationError('');
        form.setData('image_upload', null);

        if (!file) {
            return;
        }

        setIsPreparingImage(true);

        try {
            form.setData('image_upload', await preparedBannerUpload(file));
        } catch {
            setImagePreparationError(
                'That image could not be prepared. Try another JPG, PNG, or WebP file.',
            );
        } finally {
            setIsPreparingImage(false);
        }
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (isPreparingImage) {
            return;
        }

        const options = {
            onSuccess: () => {
                setOpen(false);
                setEditingBanner(null);
                form.reset();
                void listing.reload();
            },
        };

        if (editingBanner) {
            form.transform((data) => ({ ...data, _method: 'put' }));
            void form.post(updateBanner.url(editingBanner.id), options);

            return;
        }

        form.transform((data) => data);
        void form.post(storeBanner.url(), options);
    };

    const deleteBanner = (banner: Banner) => {
        if (!window.confirm(`Delete ${banner.title ?? 'this slide'}?`)) {
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
                            Homepage banners
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Choose where each banner appears on the homepage.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>
                                <Plus />
                                Add banner
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingPosition === 'bottom'
                                        ? editingBanner
                                            ? 'Edit lower banner'
                                            : 'Create lower banner'
                                        : editingBanner
                                          ? 'Edit carousel slide'
                                          : 'Add banner'}
                                </DialogTitle>
                                <DialogDescription>
                                    {editingPosition === 'bottom'
                                        ? 'Change the campaign shown near the bottom of the homepage.'
                                        : 'Change the image, title, and description in the main homepage carousel.'}
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid gap-4" onSubmit={submit}>
                                {showPlacementSelector && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-placement">
                                            Where should this appear?
                                        </Label>
                                        <Select
                                            value={editingPosition}
                                            onValueChange={choosePlacement}
                                        >
                                            <SelectTrigger
                                                id="banner-placement"
                                                className="w-full"
                                            >
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="hero">
                                                    Main carousel (top)
                                                </SelectItem>
                                                <SelectItem value="bottom">
                                                    Lower homepage banner (end)
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {editingPosition === 'bottom' &&
                                            bottomBanner && (
                                                <p className="text-xs text-muted-foreground">
                                                    The lower section has one
                                                    banner. Saving here replaces
                                                    its current content.
                                                </p>
                                            )}
                                    </div>
                                )}
                                {editingPosition === 'bottom' && (
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-eyebrow">
                                            Small heading
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
                                            required
                                        />
                                        {form.errors.eyebrow && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.eyebrow}
                                            </p>
                                        )}
                                    </div>
                                )}
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
                                        required
                                    />
                                    {form.errors.title && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.title}
                                        </p>
                                    )}
                                </div>

                                {editingPosition === 'hero' ? (
                                    <div className="grid gap-2">
                                        <Label htmlFor="banner-subtitle">
                                            Description
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
                                            placeholder="Refined essentials, masterfully crafted."
                                            required
                                        />
                                        {form.errors.subtitle && (
                                            <p className="text-sm text-destructive">
                                                {form.errors.subtitle}
                                            </p>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div className="grid gap-2">
                                            <Label htmlFor="banner-body">
                                                Description
                                            </Label>
                                            <Textarea
                                                id="banner-body"
                                                value={form.data.body}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'body',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors.body && (
                                                <p className="text-sm text-destructive">
                                                    {form.errors.body}
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="banner-action-label">
                                                Button text
                                            </Label>
                                            <Input
                                                id="banner-action-label"
                                                value={
                                                    form.data
                                                        .primary_action_label
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'primary_action_label',
                                                        event.target.value,
                                                    )
                                                }
                                                required
                                            />
                                            {form.errors
                                                .primary_action_label && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .primary_action_label
                                                    }
                                                </p>
                                            )}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="banner-action-url">
                                                Button link
                                            </Label>
                                            <Input
                                                id="banner-action-url"
                                                value={
                                                    form.data.primary_action_url
                                                }
                                                onChange={(event) =>
                                                    form.setData(
                                                        'primary_action_url',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="#new-in or /collections/shirts"
                                                required
                                            />
                                            {form.errors.primary_action_url && (
                                                <p className="text-sm text-destructive">
                                                    {
                                                        form.errors
                                                            .primary_action_url
                                                    }
                                                </p>
                                            )}
                                        </div>
                                    </>
                                )}

                                <div className="grid gap-2">
                                    <Label htmlFor="banner-image-upload">
                                        Image
                                    </Label>
                                    {editingBanner?.image_url && (
                                        <div className="aspect-[2/1] overflow-hidden rounded-md border bg-muted">
                                            <img
                                                src={editingBanner.image_url}
                                                alt={
                                                    editingBanner.title ??
                                                    'Carousel slide'
                                                }
                                                decoding="async"
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <Input
                                        key={editingPosition}
                                        id="banner-image-upload"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        required={!editingBanner}
                                        onChange={changeBannerImage}
                                    />
                                    {isPreparingImage && (
                                        <p className="text-xs text-muted-foreground">
                                            Preparing image for upload...
                                        </p>
                                    )}
                                    {editingBanner && (
                                        <p className="text-xs text-muted-foreground">
                                            Leave this empty to keep the current
                                            image.
                                        </p>
                                    )}
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
                                    {imagePreparationError && (
                                        <p className="text-sm text-destructive">
                                            {imagePreparationError}
                                        </p>
                                    )}
                                </div>

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
                                        disabled={
                                            form.processing || isPreparingImage
                                        }
                                    >
                                        {editingBanner
                                            ? 'Save changes'
                                            : editingPosition === 'bottom'
                                              ? 'Create banner'
                                              : 'Add slide'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Card className="rounded-lg">
                    <CardHeader>
                        <CardTitle>
                            Main page carousel ·{' '}
                            {banners.total.toLocaleString()} slides
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        {banners.data.length === 0 && (
                            <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                                Add a slide to start the homepage carousel.
                            </div>
                        )}
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
                                                banner.title ?? 'Carousel slide'
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center text-muted-foreground">
                                            <Image className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="truncate text-base font-semibold">
                                        {banner.title ?? 'Untitled slide'}
                                    </h2>
                                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                                        {banner.subtitle ?? 'No description'}
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

                <Card className="rounded-lg">
                    <CardHeader className="flex flex-col items-start justify-between gap-4 sm:flex-row">
                        <div>
                            <CardTitle>Lower homepage banner</CardTitle>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Edit the image, text, and button shown below the
                                product sections.
                            </p>
                        </div>
                        <Button variant="outline" onClick={openBottomDialog}>
                            {bottomBanner ? <Edit /> : <Plus />}
                            {bottomBanner ? 'Edit banner' : 'Create banner'}
                        </Button>
                    </CardHeader>
                    <CardContent>
                        {bottomBanner ? (
                            <div className="grid gap-4 rounded-lg border p-4 md:grid-cols-[160px_1fr]">
                                <div className="aspect-video overflow-hidden rounded-md bg-muted">
                                    {bottomBanner.image_url ? (
                                        <img
                                            src={bottomBanner.image_url}
                                            alt={
                                                bottomBanner.title ??
                                                'Lower banner'
                                            }
                                            loading="lazy"
                                            decoding="async"
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="grid h-full place-items-center text-muted-foreground">
                                            <Image className="h-6 w-6" />
                                        </div>
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground uppercase">
                                        {bottomBanner.eyebrow}
                                    </p>
                                    <h2 className="mt-1 text-base font-semibold">
                                        {bottomBanner.title}
                                    </h2>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                        {bottomBanner.body}
                                    </p>
                                    <p className="mt-2 text-xs text-muted-foreground">
                                        {bottomBanner.primary_action_label} →{' '}
                                        {bottomBanner.primary_action_url}
                                    </p>
                                    <p className="mt-3 text-xs text-muted-foreground">
                                        Updated{' '}
                                        {formatDate(bottomBanner.updated_at)}
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                The homepage currently uses its default lower
                                banner. Create one to manage it here.
                            </p>
                        )}
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
