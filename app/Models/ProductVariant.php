<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $product_id
 * @property string $sku
 * @property string $size
 * @property string $color_name
 * @property string|null $color_hex
 * @property string|null $image_url
 * @property int|null $price_cents
 * @property int $stock_quantity
 * @property int $reserved_quantity
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Collection<int, ProductVariantImage> $images
 */
#[Fillable([
    'product_id',
    'sku',
    'size',
    'color_name',
    'color_hex',
    'image_url',
    'price_cents',
    'stock_quantity',
    'reserved_quantity',
    'is_active',
    'sort_order',
])]
class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected $attributes = [
        'stock_quantity' => 0,
        'reserved_quantity' => 0,
        'is_active' => true,
        'sort_order' => 0,
    ];

    /**
     * @return BelongsTo<Product, $this>
     */
    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** @return HasMany<InventoryMovement, $this> */
    public function inventoryMovements(): HasMany
    {
        return $this->hasMany(InventoryMovement::class);
    }

    /**
     * @return HasMany<ProductVariantImage, $this>
     */
    public function images(): HasMany
    {
        return $this->hasMany(ProductVariantImage::class)->orderBy('sort_order');
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'stock_quantity' => 'integer',
            'reserved_quantity' => 'integer',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
