<?php

namespace Database\Factories;

use App\Models\ProductVariant;
use App\Models\VirtualTryOn;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<VirtualTryOn> */
class VirtualTryOnFactory extends Factory
{
    /** @return array<string, mixed> */
    public function definition(): array
    {
        return [
            'owner_hash' => hash('sha256', 'test-owner'),
            'product_variant_id' => ProductVariant::factory(),
            'category' => 'tops',
            'garment_photo_type' => 'model',
            'garment_image_url' => '/storage/products/garment.webp',
            'expires_at' => now()->addHour(),
        ];
    }
}
