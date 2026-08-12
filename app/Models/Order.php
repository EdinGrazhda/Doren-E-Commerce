<?php

namespace App\Models;

use App\OrderStatus;
use App\PaymentStatus;
use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $order_number
 * @property OrderStatus $status
 * @property PaymentStatus $payment_status
 * @property string $customer_first_name
 * @property string $customer_last_name
 * @property string $customer_email
 * @property string|null $customer_phone
 * @property string $shipping_city
 * @property string $shipping_street_address
 * @property string|null $shipping_address_line_two
 * @property string $shipping_postal_code
 * @property string $shipping_country_code
 * @property string|null $customer_note
 * @property int $subtotal_cents
 * @property int $shipping_cents
 * @property int $tax_cents
 * @property int $discount_cents
 * @property int $total_cents
 * @property string $currency
 * @property Carbon|null $placed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'order_number',
    'status',
    'payment_status',
    'customer_first_name',
    'customer_last_name',
    'customer_email',
    'customer_phone',
    'shipping_city',
    'shipping_street_address',
    'shipping_address_line_two',
    'shipping_postal_code',
    'shipping_country_code',
    'customer_note',
    'subtotal_cents',
    'shipping_cents',
    'tax_cents',
    'discount_cents',
    'total_cents',
    'currency',
    'placed_at',
])]
class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => OrderStatus::Pending->value,
        'payment_status' => PaymentStatus::Pending->value,
        'shipping_cents' => 0,
        'tax_cents' => 0,
        'discount_cents' => 0,
        'currency' => 'USD',
        'shipping_country_code' => 'US',
    ];

    /**
     * @return HasMany<OrderItem, $this>
     */
    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'placed_at' => 'datetime',
        ];
    }
}
