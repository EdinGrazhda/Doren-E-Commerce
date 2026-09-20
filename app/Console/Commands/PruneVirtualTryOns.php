<?php

namespace App\Console\Commands;

use App\Models\VirtualTryOn;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Storage;

class PruneVirtualTryOns extends Command
{
    protected $signature = 'try-ons:prune';

    protected $description = 'Delete expired try-on photos and results, and fail stalled requests';

    public function handle(): int
    {
        VirtualTryOn::query()->where('expires_at', '<=', now())->each(function (VirtualTryOn $tryOn): void {
            Storage::disk('try-ons')->deleteDirectory($tryOn->id);
            $tryOn->delete();
        });
        VirtualTryOn::query()->whereIn('status', ['queued', 'processing'])
            ->where('created_at', '<=', now()->subMinutes(10))->each(function (VirtualTryOn $tryOn): void {
                $changed = VirtualTryOn::query()->whereKey($tryOn->id)
                    ->whereIn('status', ['queued', 'processing'])->update(['status' => 'failed']);
                if ($changed) {
                    Storage::disk('try-ons')->deleteDirectory($tryOn->id);
                }
            });

        return self::SUCCESS;
    }
}
