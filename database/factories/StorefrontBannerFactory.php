<?php

namespace Database\Factories;

use App\Models\StorefrontBanner;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<StorefrontBanner>
 */
class StorefrontBannerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'position' => fake()->randomElement(StorefrontBanner::Positions),
            'eyebrow' => fake()->optional()->words(3, true),
            'title' => fake()->sentence(4),
            'subtitle' => fake()->optional()->sentence(),
            'body' => fake()->sentence(),
            'primary_action_label' => 'Shop Now',
            'primary_action_url' => '#new-in',
            'secondary_action_label' => fake()->optional()->randomElement(['Explore', 'View All']),
            'secondary_action_url' => fake()->optional()->randomElement(['#shop-by-category', '#best-sellers']),
            'image_url' => fake()->optional()->imageUrl(width: 1600, height: 700),
            'is_active' => true,
            'sort_order' => fake()->numberBetween(1, 100),
        ];
    }
}
