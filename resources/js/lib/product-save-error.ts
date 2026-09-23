type SaveResponse = {
    status: number;
    data: string;
};

const uncertainSave =
    'Close this dialog and refresh the product list before retrying to avoid duplicates.';

const serverFailures: Record<string, string> = {
    image_processing_unavailable:
        'The server cannot process images. Hosting support must enable PHP GD with WebP support.',
    image_decode_failed:
        'The server could not read an uploaded image. Check the image files and the server image decoder.',
    image_encode_failed:
        'The server could not convert an uploaded image to WebP. Hosting support must check image processing.',
    image_resize_failed:
        'The server could not resize an uploaded image. Hosting support must check available memory.',
    image_storage_failed:
        'The server could not write an uploaded image. Hosting support must check storage permissions and disk space.',
    product_database_failed:
        'The database rejected the product save. Check the server log for the database error; do not rerun seeders as a repair.',
    product_save_failed:
        'The server failed while saving the product. Check the server log using the reference.',
};

export function productSaveHttpError(response: SaveResponse): string {
    let payload: { code?: unknown; reference?: unknown } = {};

    try {
        const parsed: unknown = JSON.parse(response.data);

        if (parsed !== null && typeof parsed === 'object') {
            payload = parsed;
        }
    } catch {
        // Proxies and hosting firewalls may return HTML rather than JSON.
    }

    const statusMessages: Record<number, string> = {
        401: 'Your session is no longer authenticated. Sign in again before saving.',
        403: 'The request was denied. Check product permissions and hosting firewall rules.',
        413: 'The upload exceeds the server request-size limit. Reduce image sizes or ask hosting support to check PHP and web-server upload limits.',
        419: 'Your session security token expired. Refresh the page and sign in again before saving.',
        422: 'The server rejected the product details or uploads. Review the highlighted fields.',
        429: 'Too many requests. Wait before trying again.',
    };
    const knownFailure =
        typeof payload.code === 'string' &&
        Object.hasOwn(serverFailures, payload.code)
            ? serverFailures[payload.code]
            : undefined;
    const message =
        knownFailure ??
        statusMessages[response.status] ??
        'The server could not complete the product save. Check the failed request and server logs.';
    const reference =
        typeof payload.reference === 'string' &&
        /^[a-f0-9-]{36}$/i.test(payload.reference)
            ? ` Reference: ${payload.reference}.`
            : '';

    return `${message} (HTTP ${response.status}).${reference}${response.status >= 500 ? ` ${uncertainSave}` : ''}`;
}

export function productSaveRequestError(error: unknown): string {
    if (error instanceof Error) {
        if (error.name === 'SyntaxError') {
            return `The server returned an unexpected response instead of product data. Check for a login redirect or hosting error page. ${uncertainSave}`;
        }

        if (
            error.name === 'HttpCancelledError' ||
            error.name === 'AbortError'
        ) {
            return `The save request was interrupted. ${uncertainSave}`;
        }

        if (error.name === 'HttpNetworkError') {
            return `No response was received from the server. Check your connection and whether the host closed or blocked the upload. ${uncertainSave}`;
        }
    }

    return `The save could not be confirmed because an unexpected error occurred. ${uncertainSave}`;
}
