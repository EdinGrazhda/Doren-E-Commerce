<?php

namespace App\Console\Commands;

use App\Jobs\RunSeoAudit;
use App\Models\SeoAuditRun;
use App\Services\AuditSeoCatalog;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('seo:audit {--sync : Run the audit immediately} {--scheduled : Mark the audit as scheduled}')]
#[Description('Audit catalog content and SEO configuration and save the findings')]
class AuditSeo extends Command
{
    /**
     * Execute the console command.
     */
    public function handle(AuditSeoCatalog $audit): int
    {
        $run = SeoAuditRun::create(['source' => $this->option('scheduled') ? 'scheduled' : 'console']);
        $job = new RunSeoAudit($run->id);

        if ($this->option('sync')) {
            try {
                $job->handle($audit);
            } catch (\Throwable $exception) {
                $job->failed($exception);
                report($exception);
                $this->error('SEO audit failed. Check the application logs.');

                return self::FAILURE;
            }

            $run->refresh();
            $this->info("SEO audit #{$run->id} completed: {$run->checked_pages_count} pages checked, {$run->issues_count} findings.");
        } else {
            try {
                RunSeoAudit::dispatch($run->id);
            } catch (\Throwable $exception) {
                $job->failed($exception);
                report($exception);
                $this->error('SEO audit could not be queued. Check the application logs.');

                return self::FAILURE;
            }

            $this->info("SEO audit #{$run->id} queued.");
        }

        return self::SUCCESS;
    }
}
