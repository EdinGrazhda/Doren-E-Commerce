<?php

namespace Database\Factories;

use App\Models\Order;
use App\OrderStatus;
use App\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotalCents = fake()->numberBetween(8900, 36000);
        $shippingCents = fake()->boolean(70) ? 0 : 1200;
        $taxCents = (int) round($subtotalCents * 0.08);

        return [
            'order_number' => 'DO-'.now()->format('Ymd').'-'.Str::upper(Str::random(8)),
            'status' => OrderStatus::Pending,
            'payment_status' => PaymentStatus::Pending,
            'customer_first_name' => fake()->firstName(),
            'customer_last_name' => fake()->lastName(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'shipping_city' => fake()->city(),
            'shipping_street_address' => fake()->streetAddress(),
            'shipping_address_line_two' => fake()->boolean(25) ? fake()->secondaryAddress() : null,
            'shipping_postal_code' => fake()->postcode(),
            'shipping_country_code' => 'US',
            'customer_note' => fake()->boolean(20) ? fake()->sentence() : null,
            'subtotal_cents' => $subtotalCents,
            'shipping_cents' => $shippingCents,
            'tax_cents' => $taxCents,
            'discount_cents' => 0,
            'total_cents' => $subtotalCents + $shippingCents + $taxCents,
            'currency' => 'USD',
            'placed_at' => now(),
        ];
    }
}
