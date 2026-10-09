import type { Auth } from '@/types/auth';

declare module 'react' {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            cart: {
                count: number;
            };
            storefrontCategories: {
                id: number;
                name: string;
                slug: string;
            }[];
            dashboard: {
                orders: {
                    pending_count: number;
                };
            };
            sidebarOpen: boolean;
            [key: string]: unknown;
        };
    }
}
