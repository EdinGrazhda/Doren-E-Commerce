<?php

namespace App\Jobs;

use App\Models\VirtualTryOn;
use App\Services\VirtualTryOnClient;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Storage;
use Throwable;

class GenerateVirtualTryOn implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    public int $timeout = 270;

    public bool $failOnTimeout = true;

    public function __construct(public string $tryOnId)
    {
        $this->onConnection('try-ons')->onQueue('try-ons');
    }

    public function handle(VirtualTryOnClient $client): void
    {
        $claimed = VirtualTryOn::query()->whereKey($this->tryOnId)
            ->where('status', 'queued')->where('created_at', '>', now()->subMinutes(10))
            ->where('expires_at', '>', now())->update(['status' => 'processing']);
        if (! $claimed) {
            return;
        }
        $tryOn = VirtualTryOn::query()->findOrFail($this->tryOnId);
        try {
            $contents = $client->generate($tryOn);
            Storage::disk('try-ons')->put($tryOn->resultPath(), $contents);
            $completed = VirtualTryOn::query()->whereKey($this->tryOnId)
                ->where('status', 'processing')->where('expires_at', '>', now())
                ->update(['status' => 'completed']);
            if (! $completed) {
                Storage::disk('try-ons')->delete($tryOn->resultPath());
            }
        } finally {
            Storage::disk('try-ons')->delete($tryOn->personPath());
        }
    }

    public function failed(?Throwable $exception): void
    {
        $tryOn = VirtualTryOn::query()->find($this->tryOnId);
        if ($tryOn) {
            VirtualTryOn::query()->whereKey($this->tryOnId)
                ->whereIn('status', ['queued', 'processing'])->update(['status' => 'failed']);
            Storage::disk('try-ons')->deleteDirectory($tryOn->id);
        }
    }
}
