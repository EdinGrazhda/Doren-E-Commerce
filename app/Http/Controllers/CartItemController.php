<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCartItemRequest;
use App\Models\ProductVariant;
use App\Services\ProductCampaignPrice;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class CartItemController extends Controller
{
    public function store(StoreCartItemRequest $request, ProductCampaignPrice $campaignPrice): RedirectResponse
    {
        $validated = $request->validated();
        $variant = ProductVariant::query()
            ->with('product.activeCampaigns:id,name,discount_type,discount_value,starts_at,ends_at,is_active')
            ->findOrFail($validated['product_variant_id']);
        $pricing = $campaignPrice->calculate($variant->product, $variant->price_cents ?? $variant->product->price_cents);

        $items = session('cart.items', []);
        $key = (string) $variant->id;
        $quantity = (int) $validated['quantity'];
        $existingQuantity = (int) ($items[$key]['quantity'] ?? 0);

        $items[$key] = [
            'product_id' => $variant->product_id,
            'variant_id' => $variant->id,
            'name' => $variant->product->name,
            'slug' => $variant->product->slug,
            'image_url' => $variant->image_url ?? $variant->product->primary_image_url,
            'size' => $variant->size,
            'color_name' => $variant->color_name,
            'color_hex' => $variant->color_hex,
            'quantity' => $existingQuantity + $quantity,
            'unit_price_cents' => $pricing['price_cents'],
            'compare_at_price_cents' => $pricing['compare_at_price_cents'],
            'campaign' => $pricing['campaign'],
            'currency' => $variant->product->currency,
        ];

        session(['cart.items' => $items]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Added to cart.')]);

        return back();
    }

    public function destroy(int $variantId): RedirectResponse
    {
        $items = session('cart.items', []);

        unset($items[(string) $variantId]);

        session(['cart.items' => $items]);

        return back();
    }
}
