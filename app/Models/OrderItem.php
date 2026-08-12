<?php

namespace App\Models;

use Database\Factories\OrderItemFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $order_id
 * @property int|null $product_id
 * @property int|null $product_variant_id
 * @property string $product_name
 * @property string|null $variant_name
 * @property string|null $sku
 * @property int $unit_price_cents
 * @property int $quantity
 * @property int $line_total_cents
 * @property string $currency
 * @property array<string, mixed>|null $product_options
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_id',
    'product_id',
    'product_variant_id',
    'product_name',
    'variant_name',
    'sku',
    'unit_price_cents',
    'quantity',
    'line_total_cents',
    'currency',
    'product_options',
])]
class OrderItem extends Model
{
    /** @use HasFactory<OrderItemFactory> */
    use HasFactory;

    protected $attributes = [
        'currency' => 'USD',
    ];

    /**
     * @return BelongsTo<Order, $this>
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<ProductVariant, $this>
     */
    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'product_options' => 'array',
        ];
    }
}
