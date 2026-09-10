<?php

namespace App\Services;

use App\Models\ProductVariant;
use Illuminate\Support\Collection;

class PriceCartItems
{
    public function __construct(private readonly ProductCampaignPrice $campaignPrice) {}

    /**
     * @param  array<string, array<string, mixed>>  $cartItems
     * @return Collection<int, array<string, mixed>>
     */
    public function execute(array $cartItems): Collection
    {
        $variants = ProductVariant::query()
            ->with('product.activeCampaigns:id,name,discount_type,discount_value,starts_at,ends_at,is_active')
            ->whereKey(collect($cartItems)->pluck('variant_id'))
            ->get()
            ->keyBy('id');

        return collect($cartItems)
            ->map(function (array $item) use ($variants): ?array {
                $variant = $variants->get((int) $item['variant_id']);

                if (! $variant || ! $variant->product) {
                    return [
                        ...$item,
                        'compare_at_price_cents' => $item['compare_at_price_cents'] ?? null,
                        'campaign' => $item['campaign'] ?? null,
                        'line_total_cents' => (int) $item['unit_price_cents'] * (int) $item['quantity'],
                    ];
                }

                $pricing = $this->campaignPrice->calculate(
                    $variant->product,
                    $variant->price_cents ?? $variant->product->price_cents,
                );

                return [
                    ...$item,
                    'unit_price_cents' => $pricing['price_cents'],
                    'compare_at_price_cents' => $pricing['compare_at_price_cents'],
                    'campaign' => $pricing['campaign'],
                    'line_total_cents' => $pricing['price_cents'] * (int) $item['quantity'],
                ];
            })
            ->filter()
            ->values();
    }
}
