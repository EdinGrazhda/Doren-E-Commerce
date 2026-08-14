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
                onSuccess: (response) => setData(response.data),
                onHttpException: () => {
                    setError('The admin data could not be loaded.');
                },
                onNetworkError: () => {
                    setError('The server could not be reached.');
                },
            });
        } catch {
            setError(
                (current) => current ?? 'The admin data could not be loaded.',
            );
        }
    }, [get, url]);

    useEffect(() => {
        void get(url, {
            onSuccess: (response: ApiEnvelope<T>) => setData(response.data),
            onHttpException: () => {
                setError('The admin data could not be loaded.');
            },
            onNetworkError: () => {
                setError('The server could not be reached.');
            },
        }).catch(() => {
            setError('The admin data could not be loaded.');
        });

        return cancel;
    }, [cancel, get, url]);

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
