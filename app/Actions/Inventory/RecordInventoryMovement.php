<?php

namespace App\Actions\Inventory;

use App\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class RecordInventoryMovement
{
    public function execute(
        User $user,
        int $variantId,
        InventoryMovementType $type,
        int $quantity,
        ?int $unitAmountCents,
        ?string $reference,
        ?string $note,
    ): InventoryMovement {
        return DB::transaction(function () use (
            $user,
            $variantId,
            $type,
            $quantity,
            $unitAmountCents,
            $reference,
            $note,
        ): InventoryMovement {
            $variant = ProductVariant::query()
                ->with('product:id,name,price_cents,currency,is_active')
                ->lockForUpdate()
                ->findOrFail($variantId);

            if ($type === InventoryMovementType::Sold && (! $variant->is_active || ! $variant->product->is_active)) {
                throw ValidationException::withMessages([
                    'product_variant_id' => 'Inactive products cannot be sold.',
                ]);
            }

            $availableQuantity = max($variant->stock_quantity - $variant->reserved_quantity, 0);

            if ($type === InventoryMovementType::Sold && $availableQuantity < $quantity) {
                throw ValidationException::withMessages([
                    'quantity' => "Only {$availableQuantity} units are available to sell.",
                ]);
            }

            $balanceAfter = match ($type) {
                InventoryMovementType::Received => $variant->stock_quantity + $quantity,
                InventoryMovementType::Sold => $variant->stock_quantity - $quantity,
            };

            $variant->update(['stock_quantity' => $balanceAfter]);

            return InventoryMovement::query()->create([
                'product_variant_id' => $variant->id,
                'user_id' => $user->id,
                'type' => $type,
                'quantity' => $quantity,
                'balance_after' => $balanceAfter,
                'unit_amount_cents' => $type === InventoryMovementType::Sold
                    ? ($unitAmountCents ?? $variant->price_cents ?? $variant->product->price_cents)
                    : null,
                'product_name' => $variant->product->name,
                'variant_name' => "{$variant->color_name} / {$variant->size}",
                'sku' => $variant->sku,
                'reference' => $reference,
                'note' => $note,
            ]);
        });
    }
}
