<?php

namespace App\Services;

use App\Models\Campaign;
use App\Models\Product;

class ProductCampaignPrice
{
    /** @return array{price_cents: int, compare_at_price_cents: int|null, campaign: array{id: int, name: string}|null} */
    public function calculate(Product $product, ?int $basePriceCents = null): array
    {
        $basePriceCents ??= $product->price_cents;
        $campaigns = $product->relationLoaded('activeCampaigns')
            ? $product->activeCampaigns
            : $product->activeCampaigns()->get();
        $bestCampaign = $campaigns
            ->map(fn (Campaign $campaign): array => [
                'campaign' => $campaign,
                'price_cents' => $campaign->discountedPrice($basePriceCents),
            ])
            ->sortBy('price_cents')
            ->first();

        if (! $bestCampaign || $bestCampaign['price_cents'] >= $basePriceCents) {
            return ['price_cents' => $basePriceCents, 'compare_at_price_cents' => null, 'campaign' => null];
        }

        return [
            'price_cents' => $bestCampaign['price_cents'],
            'compare_at_price_cents' => $basePriceCents,
            'campaign' => [
                'id' => $bestCampaign['campaign']->id,
                'name' => $bestCampaign['campaign']->name,
            ],
        ];
    }
}
