<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductVariant;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<OrderItem>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 3);
        $unitPriceCents = fake()->numberBetween(6900, 18900);

        return [
            'order_id' => Order::factory(),
            'product_id' => Product::factory(),
            'product_variant_id' => fn (array $attributes) => ProductVariant::factory()
                ->for(Product::findOrFail($attributes['product_id'])),
            'product_name' => fake()->words(3, true),
            'variant_name' => fake()->randomElement(['Olive / M', 'Navy / L', 'Stone / XL']),
            'sku' => fake()->unique()->bothify('DRN-ITEM-####-??'),
            'unit_price_cents' => $unitPriceCents,
            'quantity' => $quantity,
            'line_total_cents' => $unitPriceCents * $quantity,
            'currency' => 'USD',
            'product_options' => [
                'size' => fake()->randomElement(['S', 'M', 'L', 'XL']),
                'color' => fake()->randomElement(['Olive', 'Navy', 'Stone']),
            ],
        ];
    }
}
