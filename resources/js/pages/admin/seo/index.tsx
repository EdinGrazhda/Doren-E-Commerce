import { Head, useHttp, usePage } from '@inertiajs/react';
import { CircleAlert, Play, RefreshCw, SearchCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import { AdminApiState } from '@/components/admin-api-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminApi } from '@/hooks/use-admin-api';
import { formatDate, titleCase } from '@/lib/admin-format';
import { index, store } from '@/routes/api/admin/seo';

type Finding = {
    code: string;
    severity: 'error' | 'warning' | 'info';
    title: string;
    recommendation: string;
    path: string | null;
};

type AuditRun = {
    id: number;
    status: 'queued' | 'running' | 'completed' | 'failed';
    source: 'admin' | 'console' | 'scheduled';
    checked_pages_count: number;
    issues_count: number;
    summary: {
        products_checked?: number;
        categories_checked?: number;
        product_limit?: number;
        catalog_truncated?: boolean;
        findings_truncated?: boolean;
    };
    findings: Finding[];
    failure_message: string | null;
    started_at: string | null;
    completed_at: string | null;
    created_at: string;
};

type AuditData = {
    runs: AuditRun[];
    automation_enabled: boolean;
    scope: string;
    external_data_available: false;
};

export default function AdminSeoIndex() {
    const { auth } = usePage().props;
    const listing = useAdminApi<AuditData>(index.url());
    const request = useHttp<Record<string, never>, { data: { run: AuditRun } }>({});
    const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
    const [runError, setRunError] = useState<string | null>(null);
    const canRun = auth.user.permissions?.includes('seo.run') ?? false;
    const hasActiveRun = listing.data?.runs.some((run) =>
        ['queued', 'running'].includes(run.status),
    );
    const reload = listing.reload;

    useEffect(() => {
        if (!hasActiveRun) {
            return;
        }

        const interval = window.setInterval(() => void reload(), 5000);

        return () => window.clearInterval(interval);
    }, [hasActiveRun, reload]);

    const runAudit = async () => {
        setRunError(null);

        try {
            await request.post(store.url(), {
                onSuccess: (response) => {
                    setSelectedRunId(response.data.run.id);
                    void reload();
                },
            });
        } catch {
            setRunError('The audit could not be started. Refresh and try again.');
        }
    };

    if (!listing.data) {
        return (
            <>
                <Head title="SEO audits" />
                <AdminApiState error={listing.error} />
            </>
        );
    }

    const { runs, automation_enabled: automationEnabled, scope } = listing.data;
    const selectedRun =
        runs.find((run) => run.id === selectedRunId) ?? runs[0] ?? null;
    const auditComplete = selectedRun?.status === 'completed';

    return (
        <>
            <Head title="SEO audits" />
            <div className="flex flex-1 flex-col gap-6 p-4 md:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">SEO audits</h1>
                        <p className="text-sm text-muted-foreground">
                            Review catalog search readiness and follow up on specific issues.
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" onClick={() => void reload()}>
                            <RefreshCw />
                            Refresh
                        </Button>
                        {canRun && (
                            <Button
                                disabled={request.processing || hasActiveRun}
                                onClick={() => void runAudit()}
                            >
                                <Play />
                                {request.processing ? 'Starting…' : 'Run audit'}
                            </Button>
                        )}
                    </div>
                </div>

                {(runError || listing.error) && (
                    <p role="alert" className="text-sm text-destructive">
                        {runError ?? listing.error}
                    </p>
                )}

                <Card>
                    <CardContent className="grid gap-3 pt-6 text-sm">
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchCheck className="size-4" />
                            <span className="font-medium">Catalog and configuration checks</span>
                            <Badge variant={automationEnabled ? 'default' : 'secondary'}>
                                {automationEnabled ? 'Daily audit enabled' : 'Manual audits'}
                            </Badge>
                        </div>
                        <p className="text-muted-foreground">{scope}</p>
                        <p className="text-muted-foreground">
                            The audit does not validate the existing GA4 tag or import Search Console, ranking, or AI answer data.
                            are not connected. Results describe this application’s catalog and
                            configuration; they do not measure traffic, conversions or rankings.
                        </p>
                    </CardContent>
                </Card>

                {selectedRun ? (
                    <>
                        <div className="grid gap-4 sm:grid-cols-3">
                            <Card>
                                <CardHeader><CardTitle>Run #{selectedRun.id}</CardTitle></CardHeader>
                                <CardContent>
                                    <Badge variant={selectedRun.status === 'failed' ? 'destructive' : 'secondary'}>
                                        {titleCase(selectedRun.status)}
                                    </Badge>
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {formatDate(selectedRun.created_at)} · {titleCase(selectedRun.source)}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Pages checked</CardTitle></CardHeader>
                                <CardContent className="text-3xl font-semibold">
                                    {auditComplete ? selectedRun.checked_pages_count : '—'}
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader><CardTitle>Issues found</CardTitle></CardHeader>
                                <CardContent className="text-3xl font-semibold">
                                    {auditComplete ? selectedRun.issues_count : '—'}
                                </CardContent>
                            </Card>
                        </div>

                        <Card>
                            <CardHeader><CardTitle>Findings</CardTitle></CardHeader>
                            <CardContent className="grid gap-4">
                                {['queued', 'running'].includes(selectedRun.status) && (
                                    <p role="status" className="text-sm text-muted-foreground">
                                        {selectedRun.status === 'queued'
                                            ? 'Waiting for the queue worker. This page will refresh automatically.'
                                            : 'Audit in progress. Results will appear when it finishes.'}
                                    </p>
                                )}
                                {selectedRun.status === 'failed' && (
                                    <p role="alert" className="text-sm text-destructive">
                                        {selectedRun.failure_message ?? 'The audit failed. Start a new run to retry.'}
                                    </p>
                                )}
                                {auditComplete && selectedRun.issues_count === 0 && (
                                    <p className="text-sm text-muted-foreground">
                                        No issues found within the checked scope.
                                    </p>
                                )}
                                {selectedRun.summary.catalog_truncated && (
                                    <p className="text-sm text-muted-foreground">
                                        This run checked up to {selectedRun.summary.product_limit} products.
                                        Remaining catalog pages have not been assessed.
                                    </p>
                                )}
                                {selectedRun.summary.findings_truncated && (
                                    <p className="text-sm text-muted-foreground">
                                        Showing {selectedRun.findings.length} of {selectedRun.issues_count} findings.
                                    </p>
                                )}
                                {selectedRun.findings.map((finding, findingIndex) => (
                                    <article key={`${finding.code}-${finding.path}-${findingIndex}`} className="rounded-lg border p-4">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <CircleAlert className="size-4 shrink-0" />
                                            <h2 className="font-medium">{finding.title}</h2>
                                            <Badge variant={finding.severity === 'error' ? 'destructive' : 'outline'}>
                                                {titleCase(finding.severity)}
                                            </Badge>
                                        </div>
                                        {finding.path && (
                                            <p className="mt-2 text-sm break-all text-muted-foreground">{finding.path}</p>
                                        )}
                                        <p className="mt-2 text-sm">{finding.recommendation}</p>
                                    </article>
                                ))}
                            </CardContent>
                        </Card>
                    </>
                ) : (
                    <Card>
                        <CardContent className="py-10 text-center text-sm text-muted-foreground">
                            No audits yet. {canRun ? 'Run an audit to check the current catalog.' : 'Ask an administrator to start an audit.'}
                        </CardContent>
                    </Card>
                )}

                {runs.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle>Recent runs</CardTitle></CardHeader>
                        <CardContent className="grid gap-2">
                            {runs.map((run) => (
                                <button
                                    key={run.id}
                                    type="button"
                                    aria-pressed={selectedRun?.id === run.id}
                                    onClick={() => setSelectedRunId(run.id)}
                                    className="flex flex-wrap items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm hover:bg-muted aria-pressed:border-primary aria-pressed:bg-muted"
                                >
                                    <span>#{run.id} · {formatDate(run.created_at)} · {titleCase(run.source)}</span>
                                    <span className="flex items-center gap-3">
                                        {run.status === 'completed' && <span>{run.issues_count} issues</span>}
                                        <Badge variant={run.status === 'failed' ? 'destructive' : 'secondary'}>{titleCase(run.status)}</Badge>
                                    </span>
                                </button>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}
