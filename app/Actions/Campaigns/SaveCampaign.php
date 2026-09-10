<?php

namespace App\Actions\Campaigns;

use App\Models\Campaign;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class SaveCampaign
{
    /** @param array<string, mixed> $data */
    public function execute(array $data, ?Campaign $campaign = null): Campaign
    {
        return DB::transaction(function () use ($data, $campaign): Campaign {
            $productIds = collect($data['product_ids'])->map(fn ($id): int => (int) $id)->all();

            if ($data['is_active'] && $this->hasOverlap($productIds, $data, $campaign)) {
                throw ValidationException::withMessages([
                    'product_ids' => 'One or more selected products already belong to an overlapping active campaign.',
                ]);
            }

            $campaign ??= new Campaign;
            $campaign->fill(Arr::except($data, 'product_ids'))->save();
            $campaign->products()->sync($productIds);

            return $campaign->load('products:id,name,price_cents,currency,primary_image_url');
        });
    }

    /** @param array<int, int> $productIds @param array<string, mixed> $data */
    private function hasOverlap(array $productIds, array $data, ?Campaign $campaign): bool
    {
        return Campaign::query()
            ->where('is_active', true)
            ->when($campaign, fn ($query) => $query->whereKeyNot($campaign->id))
            ->whereHas('products', fn ($query) => $query->whereKey($productIds))
            ->when($data['ends_at'] ?? null, fn ($query, $endsAt) => $query->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<', $endsAt)))
            ->when($data['starts_at'] ?? null, fn ($query, $startsAt) => $query->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>', $startsAt)))
            ->exists();
    }
}
