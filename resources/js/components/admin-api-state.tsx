import { AlertCircle, LoaderCircle } from 'lucide-react';

type Props = {
    error?: string | null;
};

export function AdminApiState({ error }: Props) {
    return (
        <div className="flex min-h-64 flex-1 items-center justify-center p-6">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
                {error ? (
                    <AlertCircle className="size-5 text-destructive" />
                ) : (
                    <LoaderCircle className="size-5 animate-spin" />
                )}
                <span>{error ?? 'Loading admin data...'}</span>
            </div>
        </div>
    );
}
