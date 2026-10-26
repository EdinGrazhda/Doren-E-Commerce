<?php

namespace App\Jobs;

use App\Models\SeoAuditRun;
use App\Services\AuditSeoCatalog;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;
use Throwable;

class RunSeoAudit implements ShouldBeUnique, ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 60;

    public int $uniqueFor = 3600;

    public bool $failOnTimeout = true;

    public function __construct(public int $auditRunId) {}

    public function uniqueId(): string
    {
        return (string) $this->auditRunId;
    }

    /** @return array<int, int> */
    public function backoff(): array
    {
        return [10, 30, 60];
    }

    public function handle(AuditSeoCatalog $audit): void
    {
        $run = SeoAuditRun::findOrFail($this->auditRunId);

        if ($run->status === 'completed') {
            return;
        }

        $run->update([
            'status' => 'running',
            'started_at' => $run->started_at ?? now(),
            'completed_at' => null,
            'failure_message' => null,
        ]);

        $run->update([
            ...$audit->run(),
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }

    public function failed(?Throwable $exception): void
    {
        SeoAuditRun::query()
            ->whereKey($this->auditRunId)
            ->where('status', '!=', 'completed')
            ->update([
                'status' => 'failed',
                'failure_message' => 'The audit could not finish. Check the application logs and run it again.',
                'completed_at' => now(),
            ]);

        Log::error('SEO audit failed.', [
            'audit_run_id' => $this->auditRunId,
            'exception_type' => $exception === null ? null : $exception::class,
        ]);
    }
}
