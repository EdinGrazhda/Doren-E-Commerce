<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\ProductVariantImage;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductVariantImage>
 */
class ProductVariantImageFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_variant_id' => ProductVariant::factory(),
            'image_url' => $this->faker->imageUrl(width: 900, height: 1100),
            'sort_order' => $this->faker->numberBetween(0, 3),
        ];
    }
}
