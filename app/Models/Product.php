<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $product_category_id
 * @property string $name
 * @property string $slug
 * @property string|null $sku
 * @property string|null $description
 * @property int $price_cents
 * @property int|null $compare_at_price_cents
 * @property string $currency
 * @property string|null $primary_image_url
 * @property array<int, string>|null $gallery_image_urls
 * @property bool $is_active
 * @property bool $is_featured
 * @property int $sort_order
 * @property Carbon|null $published_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'product_category_id',
    'name',
    'slug',
    'sku',
    'description',
    'price_cents',
    'compare_at_price_cents',
    'currency',
    'primary_image_url',
    'gallery_image_urls',
    'is_active',
    'is_featured',
    'sort_order',
    'published_at',
])]
class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $attributes = [
        'currency' => 'USD',
        'is_active' => true,
        'is_featured' => false,
        'sort_order' => 0,
    ];

    /**
     * @return BelongsTo<ProductCategory, $this>
     */
    public function category(): BelongsTo
    {
        return $this->belongsTo(ProductCategory::class, 'product_category_id');
    }

    /**
     * @return HasMany<ProductVariant, $this>
     */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'gallery_image_urls' => 'array',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'sort_order' => 'integer',
            'published_at' => 'datetime',
        ];
    }
}
