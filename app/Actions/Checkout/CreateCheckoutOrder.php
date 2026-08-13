<?php

namespace App\Actions\Checkout;

use App\Models\Order;
use App\Models\ProductVariant;
use App\OrderStatus;
use App\PaymentStatus;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use RuntimeException;

class CreateCheckoutOrder
{
    /**
     * @param  array<string, mixed>  $customerData
     * @param  array<string, array<string, mixed>>  $cartItems
     */
    public function execute(array $customerData, array $cartItems): Order
    {
        return DB::transaction(function () use ($customerData, $cartItems): Order {
            $variantIds = collect($cartItems)->pluck('variant_id')->values();
            $variants = ProductVariant::query()
                ->with('product:id,name,slug,is_active,price_cents,currency')
                ->whereIn('id', $variantIds)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $subtotalCents = collect($cartItems)->sum(
                fn (array $item): int => (int) $item['unit_price_cents'] * (int) $item['quantity'],
            );
            $currency = collect($cartItems)->first()['currency'] ?? 'USD';

            $order = Order::query()->create([
                ...$customerData,
                'shipping_country_code' => Str::upper((string) $customerData['shipping_country_code']),
                'order_number' => $this->orderNumber(),
                'status' => OrderStatus::Pending,
                'payment_status' => PaymentStatus::Pending,
                'subtotal_cents' => $subtotalCents,
                'shipping_cents' => 0,
                'tax_cents' => 0,
                'discount_cents' => 0,
                'total_cents' => $subtotalCents,
                'currency' => $currency,
                'placed_at' => now(),
            ]);

            foreach ($cartItems as $item) {
                $variant = $variants->get((int) $item['variant_id']);

                if (! $variant || ! $variant->is_active || ! $variant->product?->is_active) {
                    throw new RuntimeException(__('One of your cart items is no longer available.'));
                }

                if ($variant->stock_quantity < (int) $item['quantity']) {
                    throw new RuntimeException(__('One of your cart items is out of stock.'));
                }

                $unitPriceCents = (int) ($variant->price_cents ?? $variant->product->price_cents);
                $quantity = (int) $item['quantity'];

                $order->items()->create([
                    'product_id' => $variant->product_id,
                    'product_variant_id' => $variant->id,
                    'product_name' => $variant->product->name,
                    'variant_name' => "{$variant->color_name} / {$variant->size}",
                    'sku' => $variant->sku,
                    'unit_price_cents' => $unitPriceCents,
                    'quantity' => $quantity,
                    'line_total_cents' => $unitPriceCents * $quantity,
                    'currency' => $variant->product->currency,
                    'product_options' => [
                        'size' => $variant->size,
                        'color' => $variant->color_name,
                        'color_hex' => $variant->color_hex,
                    ],
                ]);

                $variant->decrement('stock_quantity', $quantity);
            }

            return $order;
        });
    }

    private function orderNumber(): string
    {
        do {
            $orderNumber = 'DO-'.now()->format('Ymd').'-'.Str::upper(Str::random(8));
        } while (Order::query()->where('order_number', $orderNumber)->exists());

        return $orderNumber;
    }
}
