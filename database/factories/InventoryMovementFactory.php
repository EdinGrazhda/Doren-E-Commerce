<?php

namespace Database\Factories;

use App\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\ProductVariant;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<InventoryMovement>
 */
class InventoryMovementFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $quantity = fake()->numberBetween(1, 20);

        return [
            'product_variant_id' => ProductVariant::factory(),
            'user_id' => User::factory()->admin(),
            'type' => InventoryMovementType::Received,
            'quantity' => $quantity,
            'balance_after' => fake()->numberBetween($quantity, 100),
            'unit_amount_cents' => null,
            'product_name' => fake()->words(3, true),
            'variant_name' => 'Navy / M',
            'sku' => fake()->unique()->bothify('INV-####-??'),
            'reference' => fake()->optional()->bothify('REF-####'),
            'note' => fake()->optional()->sentence(),
        ];
    }

    public function sold(): static
    {
        return $this->state(fn (): array => [
            'type' => InventoryMovementType::Sold,
            'unit_amount_cents' => fake()->numberBetween(1000, 25000),
        ]);
    }
}
