<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $priceCents = fake()->numberBetween(6900, 18900);

        return [
            'product_category_id' => ProductCategory::factory(),
            'name' => Str::headline($name),
            'slug' => Str::slug($name),
            'sku' => Str::upper(fake()->unique()->bothify('DRN-####-??')),
            'description' => fake()->paragraph(),
            'price_cents' => $priceCents,
            'compare_at_price_cents' => fake()->boolean(25) ? $priceCents + 3000 : null,
            'currency' => 'USD',
            'primary_image_url' => fake()->imageUrl(width: 900, height: 1100),
            'gallery_image_urls' => [
                fake()->imageUrl(width: 900, height: 1100),
                fake()->imageUrl(width: 900, height: 1100),
            ],
            'is_active' => true,
            'is_featured' => fake()->boolean(30),
            'sort_order' => fake()->numberBetween(1, 100),
            'published_at' => now(),
        ];
    }
}
