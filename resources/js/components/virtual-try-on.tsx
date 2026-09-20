import { useHttp } from '@inertiajs/react';
import { Download, LoaderCircle, Sparkles, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { store } from '@/routes/products/try-ons';
import { destroy, show } from '@/routes/try-ons';

type TryOn = {
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
    image_url: string | null;
    expires_at: string;
};
type Envelope = { data: TryOn };
type Props = {
    productSlug: string;
    productName: string;
    variant:
        | { id: number; color_name: string; image_url: string | null }
        | undefined;
    enabled: boolean;
    requiresGarmentImage: boolean;
};

export function VirtualTryOn({
    productSlug,
    productName,
    variant,
    enabled,
    requiresGarmentImage,
}: Props) {
    const [open, setOpen] = useState(false);
    const [job, setJob] = useState<TryOn | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pollAttempt, setPollAttempt] = useState(0);
    const [garment, setGarment] = useState<Props['variant']>(undefined);
    const [imageFailed, setImageFailed] = useState(false);
    const form = useHttp<
        { photo: File | null; consent: boolean; product_variant_id: number },
        Envelope
    >({
        photo: null,
        consent: false,
        product_variant_id: 0,
    });
    const { get, cancel } = useHttp<Record<string, never>, Envelope>({});
    const deletion = useHttp<Record<string, never>>({});
    const busy = job?.status === 'queued' || job?.status === 'processing';
    const activeGarment = job ? garment : variant;
    const generationUnavailable = !enabled
        ? 'AI generation is currently unavailable. You can select a photo and preview it here; it stays in your browser until you generate a try-on.'
        : requiresGarmentImage && !variant?.image_url
          ? 'This color does not have a garment photo yet. You can preview your own photo, but generation needs a product photo for the selected color.'
          : null;

    useEffect(() => {
        return () => {
            if (preview) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const jobId = job?.id;
    useEffect(() => {
        if (!open || !jobId || !busy) {
            return;
        }

        let stopped = false;
        let timer: ReturnType<typeof setTimeout>;
        const poll = async () => {
            try {
                const response = await get(show.url(jobId));

                if (stopped) {
                    return;
                }

                setJob(response.data);
                setError(null);

                if (['queued', 'processing'].includes(response.data.status)) {
                    timer = setTimeout(poll, document.hidden ? 15000 : 3000);
                }
            } catch {
                if (!stopped) {
                    setError(
                        'We could not check your preview. Check your connection and try again. Previews expire after one hour.',
                    );
                }
            }
        };
        timer = setTimeout(poll, 1000);

        return () => {
            stopped = true;
            clearTimeout(timer);
            cancel();
        };
    }, [open, jobId, busy, get, cancel, pollAttempt]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();

        if (
            generationUnavailable ||
            !variant ||
            !form.data.photo ||
            !form.data.consent ||
            form.processing ||
            job
        ) {
            return;
        }

        setError(null);
        setGarment(variant);
        form.transform((data) => ({ ...data, product_variant_id: variant.id }));

        try {
            const response = await form.post(store.url(productSlug), {
                onHttpException: (response) => {
                    const messages: Record<number, string> = {
                        409: 'A preview is already being prepared. Please wait before starting another.',
                        413: 'This photo is too large. Choose a photo smaller than 10 MB.',
                        419: 'Your session expired. Refresh the page and try again.',
                        429: 'You have reached the try-on limit. Please try again later.',
                        503: 'AI try-on is temporarily unavailable. Please try again later.',
                    };
                    setError(
                        messages[response.status] ??
                            'Your preview could not be started. Please try again.',
                    );
                },
            });
            setJob(response.data);
        } catch {
            setError(
                (current) =>
                    current ??
                    'Check your photo and connection, then try again.',
            );
        }
    };

    const remove = async () => {
        if (!job) {
            return;
        }

        setError(null);

        try {
            await deletion.delete(destroy.url(job.id));
        } catch {
            setError(
                'We could not delete the preview. Try again; stored images are automatically removed after expiry.',
            );

            return;
        }

        setJob(null);
        setPreview(null);
        setImageFailed(false);
        form.resetAndClearErrors();
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="mt-3 grid gap-2">
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="inline-flex h-12 items-center justify-center gap-3 border border-[#8d6b35] bg-[#eee5d6] px-6 text-[11px] font-bold tracking-[0.12em] text-[#60491f] uppercase"
                    >
                        <Sparkles className="size-4" /> Try it with AI
                    </button>
                </DialogTrigger>
                <p className="text-center text-xs text-[#726b60]">
                    {!enabled
                        ? 'Open the fitting room to preview your photo. AI generation is currently unavailable.'
                        : !variant?.image_url
                          ? 'Choose a color with a product photo to try it on.'
                          : 'See this style on you. A visual preview, not a size recommendation.'}
                </p>
            </div>
            <DialogContent className="max-h-[90dvh] overflow-y-auto border-[#d6cec0] bg-[#f8f4ed] text-[#151513] sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="size-5 text-[#8d6b35]" /> Your
                        virtual fitting room
                    </DialogTitle>
                    <DialogDescription>
                        Try {productName}
                        {activeGarment
                            ? ` in ${activeGarment.color_name}`
                            : ''}{' '}
                        with your own photo.
                    </DialogDescription>
                </DialogHeader>
                {!job && generationUnavailable && (
                    <p
                        id="try-on-availability"
                        role="status"
                        className="rounded-md border border-[#d6cec0] bg-[#eee5d6] p-3 text-sm leading-relaxed text-[#60491f]"
                    >
                        {generationUnavailable}
                    </p>
                )}
                <div
                    className={
                        activeGarment?.image_url
                            ? 'grid grid-cols-2 gap-4'
                            : 'mx-auto grid w-full max-w-64 gap-4'
                    }
                >
                    {activeGarment?.image_url && (
                        <figure className="grid gap-2">
                            <img
                                src={activeGarment.image_url}
                                alt={`${productName}, ${activeGarment.color_name}`}
                                className="aspect-[3/4] max-h-64 w-full rounded-md bg-[#e8e0d4] object-contain"
                            />
                            <figcaption className="text-center text-xs">
                                Selected garment
                            </figcaption>
                        </figure>
                    )}
                    <figure className="grid gap-2">
                        <div className="flex aspect-[3/4] max-h-64 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-[#cbbda6] bg-[#eee8dd]">
                            {job?.image_url && !imageFailed ? (
                                <img
                                    src={job.image_url}
                                    alt={`AI preview of you wearing ${productName}`}
                                    className="h-full w-full object-contain"
                                    onError={() => setImageFailed(true)}
                                />
                            ) : preview ? (
                                <img
                                    src={preview}
                                    alt="Your uploaded photo"
                                    className="h-full w-full object-contain"
                                />
                            ) : (
                                <div className="grid gap-3 p-6 text-center text-sm text-[#726b60]">
                                    <Upload className="mx-auto size-7" />
                                    Your full-body photo
                                </div>
                            )}
                        </div>
                        <figcaption className="text-center text-xs">
                            {job?.status === 'completed' && !imageFailed
                                ? 'AI-generated preview'
                                : 'Your photo'}
                        </figcaption>
                    </figure>
                </div>
                {!job && (
                    <form onSubmit={submit} className="grid gap-4">
                        <div className="grid gap-2">
                            <label
                                htmlFor="try-on-photo"
                                className="text-sm font-medium"
                            >
                                Upload a full-body photo
                            </label>
                            <input
                                id="try-on-photo"
                                type="file"
                                accept="image/jpeg,image/png,image/webp"
                                disabled={form.processing}
                                className="w-full rounded-md border border-[#d6cec0] p-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-[#e8dfce] file:px-3 file:py-2"
                                onChange={(event) => {
                                    const photo =
                                        event.target.files?.[0] ?? null;
                                    form.clearErrors();

                                    if (
                                        photo &&
                                        photo.size > 10 * 1024 * 1024
                                    ) {
                                        form.setData('photo', null);
                                        setPreview(null);
                                        form.setError(
                                            'photo',
                                            'Choose a photo smaller than 10 MB.',
                                        );

                                        return;
                                    }

                                    form.setData('photo', photo);
                                    setPreview(
                                        photo
                                            ? URL.createObjectURL(photo)
                                            : null,
                                    );
                                }}
                            />
                            <p className="text-xs text-[#726b60]">
                                JPEG, PNG or WebP, up to 10 MB. Stand facing the
                                camera with your whole body visible, good
                                lighting and arms slightly away from your body.
                                Use a photo of one person.
                            </p>
                            {form.errors.photo && (
                                <p
                                    role="alert"
                                    className="text-sm text-red-700"
                                >
                                    {form.errors.photo}
                                </p>
                            )}
                        </div>
                        <label className="flex items-start gap-2 text-xs leading-relaxed">
                            <input
                                type="checkbox"
                                checked={form.data.consent}
                                disabled={form.processing}
                                onChange={(event) =>
                                    form.setData(
                                        'consent',
                                        event.target.checked,
                                    )
                                }
                                className="mt-1 size-4 shrink-0 accent-[#8d6b35]"
                            />
                            I have permission to use this photo and agree to its
                            processing for this preview. My upload is deleted
                            after processing. Results expire after one hour and
                            are removed automatically within five minutes of
                            expiry.
                        </label>
                        {form.errors.consent && (
                            <p role="alert" className="text-sm text-red-700">
                                {form.errors.consent}
                            </p>
                        )}
                        {form.errors.product_variant_id && (
                            <p role="alert" className="text-sm text-red-700">
                                {form.errors.product_variant_id}
                            </p>
                        )}
                        <Button
                            type="submit"
                            disabled={
                                Boolean(generationUnavailable) ||
                                !form.data.photo ||
                                !form.data.consent ||
                                form.processing
                            }
                            aria-describedby={
                                generationUnavailable
                                    ? 'try-on-availability'
                                    : undefined
                            }
                            className="bg-[#151513] text-white hover:bg-[#36332e]"
                        >
                            {form.processing ? (
                                <>
                                    <LoaderCircle className="size-4 animate-spin" />
                                    {form.progress
                                        ? `Uploading ${form.progress.percentage}%`
                                        : 'Starting your preview…'}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="size-4" />
                                    Generate my preview
                                </>
                            )}
                        </Button>
                    </form>
                )}
                {busy && (
                    <div
                        role="status"
                        aria-live="polite"
                        className="flex items-center gap-3 rounded-md bg-[#eee5d6] p-4 text-sm"
                    >
                        <LoaderCircle className="size-5 shrink-0 animate-spin" />
                        <div>
                            <p className="font-medium">
                                {job.status === 'queued'
                                    ? 'Your preview is in the queue'
                                    : 'Creating your preview'}
                            </p>
                            <p className="mt-1 text-xs">
                                This may take a few minutes. You can close and
                                reopen this window while you stay on this page.
                            </p>
                        </div>
                    </div>
                )}
                {job?.status === 'failed' && (
                    <p role="alert" className="text-sm text-red-700">
                        We could not generate this preview. Clear it below, then
                        try a well-lit, front-facing photo. The service may also
                        be temporarily busy.
                    </p>
                )}
                {imageFailed && (
                    <p role="alert" className="text-sm text-red-700">
                        This preview could not be loaded or has expired. Clear
                        it to start again.
                    </p>
                )}
                {error && (
                    <div
                        role="alert"
                        className="grid gap-2 text-sm text-red-700"
                    >
                        <p>{error}</p>
                        {busy && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => {
                                    setError(null);
                                    setPollAttempt((value) => value + 1);
                                }}
                            >
                                Check progress again
                            </Button>
                        )}
                    </div>
                )}
                {job && (
                    <div className="flex flex-wrap gap-2">
                        {job.image_url && !imageFailed && (
                            <Button
                                asChild
                                className="bg-[#151513] text-white hover:bg-[#36332e]"
                            >
                                <a
                                    href={job.image_url}
                                    download="doren-try-on.png"
                                >
                                    <Download className="size-4" />
                                    Download preview
                                </a>
                            </Button>
                        )}
                        <Button
                            type="button"
                            variant="outline"
                            disabled={deletion.processing}
                            onClick={() => void remove()}
                        >
                            <Trash2 className="size-4" />
                            {busy
                                ? 'Cancel and delete photos'
                                : 'Delete preview and start again'}
                        </Button>
                    </div>
                )}
                <p className="text-xs leading-relaxed text-[#726b60]">
                    AI may change details, proportions or colors. This preview
                    does not measure fit or guarantee how a size will look.
                    Refer to the product photos and size guide before ordering.
                </p>
            </DialogContent>
        </Dialog>
    );
}
