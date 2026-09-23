import { useHttp } from '@inertiajs/react';
import { useCallback, useEffect, useState } from 'react';

type ApiEnvelope<T> = {
    data: T;
};

export function useAdminApi<T>(url: string) {
    const { get, cancel, processing } = useHttp<
        Record<string, never>,
        ApiEnvelope<T>
    >({});
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        try {
            await get(url, {
                onSuccess: (response) => {
                    setData(response.data);
                    setError(null);
                },
                onHttpException: () => {
                    setError('The admin data could not be loaded.');
                },
                onNetworkError: () => {
                    setError('The server could not be reached.');
                },
                onCancel: () => undefined,
            });
        } catch (error) {
            if (error instanceof Error && error.name === 'HttpCancelledError') {
                return;
            }

            setError(
                (current) => current ?? 'The admin data could not be loaded.',
            );
        }
    }, [get, url]);

    useEffect(() => {
        void fetchData();

        return cancel;
    }, [cancel, fetchData]);

    const reload = useCallback(async () => {
        setError(null);
        await fetchData();
    }, [fetchData]);

    return {
        data,
        error,
        loading: processing && data === null,
        reload,
    };
}
