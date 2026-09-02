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
    title: string | null;
    subtitle: string | null;
    image_url: string | null;
    updated_at: string;
};

type Props = {
    banners: AdminPaginationMeta<Banner>;
};

type BannerFormData = {
    title: string;
    subtitle: string;
    image_upload: File | null;
};

const emptyBanner: BannerFormData = {
    title: '',
    subtitle: '',
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

    const { banners } = listing.data;

    const openCreateDialog = () => {
        setEditingBanner(null);
        setImagePreparationError('');
        form.clearErrors();
        form.setData(emptyBanner);
        setOpen(true);
    };

    const openEditDialog = (banner: Banner) => {
        setEditingBanner(banner);
        setImagePreparationError('');
        form.clearErrors();
        form.setData({
            title: banner.title ?? '',
            subtitle: banner.subtitle ?? '',
            image_upload: null,
        });
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
                            Main page carousel
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Change the image, title, and description shown in
                            the homepage hero.
                        </p>
                    </div>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button onClick={openCreateDialog}>
                                <Plus />
                                New slide
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle>
                                    {editingBanner
                                        ? 'Edit carousel slide'
                                        : 'New carousel slide'}
                                </DialogTitle>
                                <DialogDescription>
                                    These are the only details that change in
                                    the main homepage banner.
                                </DialogDescription>
                            </DialogHeader>

                            <form className="grid gap-4" onSubmit={submit}>
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
                                    />
                                    {form.errors.subtitle && (
                                        <p className="text-sm text-destructive">
                                            {form.errors.subtitle}
                                        </p>
                                    )}
                                </div>

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
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    )}
                                    <Input
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
                            {banners.total.toLocaleString()} carousel slides
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
