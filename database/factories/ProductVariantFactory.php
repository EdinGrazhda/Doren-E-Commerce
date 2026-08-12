<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<ProductVariant>
 */
class ProductVariantFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $colorName = fake()->randomElement(['Olive', 'Navy', 'Stone', 'White', 'Black']);

        return [
            'product_id' => Product::factory(),
            'sku' => Str::upper(fake()->unique()->bothify('DRN-VAR-####-??')),
            'size' => fake()->randomElement(['S', 'M', 'L', 'XL']),
            'color_name' => $colorName,
            'color_hex' => fake()->hexColor(),
            'price_cents' => null,
            'stock_quantity' => fake()->numberBetween(5, 75),
            'reserved_quantity' => 0,
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 30),
        ];
    }
}
