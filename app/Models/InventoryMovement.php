<?php

namespace App\Models;

use App\InventoryMovementType;
use Database\Factories\InventoryMovementFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $product_variant_id
 * @property int|null $user_id
 * @property InventoryMovementType $type
 * @property int $quantity
 * @property int $balance_after
 * @property int|null $unit_amount_cents
 * @property string $product_name
 * @property string $variant_name
 * @property string $sku
 * @property string|null $reference
 * @property string|null $note
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'product_variant_id',
    'user_id',
    'type',
    'quantity',
    'balance_after',
    'unit_amount_cents',
    'product_name',
    'variant_name',
    'sku',
    'reference',
    'note',
])]
class InventoryMovement extends Model
{
    /** @use HasFactory<InventoryMovementFactory> */
    use HasFactory;

    /** @return BelongsTo<ProductVariant, $this> */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'type' => InventoryMovementType::class,
            'quantity' => 'integer',
            'balance_after' => 'integer',
            'unit_amount_cents' => 'integer',
        ];
    }
}
