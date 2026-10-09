<?php

namespace App\Models;

use Database\Factories\ProductCategoryFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * @property int $id
 * @property string $name
 * @property string $slug
 * @property string|null $description
 * @property int $sort_order
 * @property bool $is_visible
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['name', 'slug', 'description', 'sort_order', 'is_visible'])]
class ProductCategory extends Model
{
    /** @use HasFactory<ProductCategoryFactory> */
    use HasFactory;

    public const array StandardSizes = ['S', 'M', 'L', 'XL', 'XXL'];

    public const array NumericSizes = [
        '28', '29', '30', '31', '32', '33', '34',
        '35', '36', '37', '38', '39', '40',
    ];

    private const array NumericSizeCategoryTerms = [
        'pants',
        'trouser',
        'underwear',
        'boxer',
        'jean',
        'chino',
    ];

    protected $attributes = [
        'sort_order' => 0,
        'is_visible' => true,
    ];

    /**
     * @return HasMany<Product, $this>
     */
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    /**
     * @return array<int, string>
     */
    public function sizeOptions(): array
    {
        return Str::contains($this->slug, self::NumericSizeCategoryTerms)
            ? self::NumericSizes
            : self::StandardSizes;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
            'is_visible' => 'boolean',
        ];
    }
}
