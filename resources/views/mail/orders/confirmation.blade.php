<x-mail::message>
# Thank you for your order, {{ $order->customer_first_name }}!

We received your order and will email you again when it is ready to ship.

<x-mail::panel>
**Order:** {{ $order->order_number }}  
**Placed:** {{ $order->placed_at?->format('F j, Y \a\t H:i') }}  
**Status:** {{ $order->status->name }}  
**Payment:** {{ $order->payment_status->name }}
</x-mail::panel>

## Order items

@foreach ($order->items as $item)
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border-bottom: 1px solid #e8e5df; padding-bottom: 20px;">
<tr>
@if (filled($item->product_options['image_url'] ?? null))
<td width="96" valign="top" style="padding-right: 16px;">
<img src="{{ Illuminate\Support\Str::startsWith($item->product_options['image_url'], ['http://', 'https://']) ? $item->product_options['image_url'] : url($item->product_options['image_url']) }}" alt="{{ $item->product_name }}" width="80" style="display: block; width: 80px; height: auto; border-radius: 4px;">
</td>
@endif
<td valign="top">
<strong>{{ $item->product_name }}</strong><br>
@if ($item->variant_name)
{{ $item->variant_name }}<br>
@endif
SKU: {{ $item->sku ?? 'N/A' }}<br>
Quantity: {{ $item->quantity }}<br>
{{ Illuminate\Support\Number::currency($item->unit_price_cents / 100, in: $item->currency) }} each
</td>
<td align="right" valign="top">
<strong>{{ Illuminate\Support\Number::currency($item->line_total_cents / 100, in: $item->currency) }}</strong>
</td>
</tr>
</table>
@endforeach

<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
<tr><td>Subtotal</td><td align="right">{{ Illuminate\Support\Number::currency($order->subtotal_cents / 100, in: $order->currency) }}</td></tr>
<tr><td>Shipping</td><td align="right">{{ $order->shipping_cents === 0 ? 'Free' : Illuminate\Support\Number::currency($order->shipping_cents / 100, in: $order->currency) }}</td></tr>
@if ($order->tax_cents > 0)
<tr><td>Tax</td><td align="right">{{ Illuminate\Support\Number::currency($order->tax_cents / 100, in: $order->currency) }}</td></tr>
@endif
@if ($order->discount_cents > 0)
<tr><td>Discount</td><td align="right">-{{ Illuminate\Support\Number::currency($order->discount_cents / 100, in: $order->currency) }}</td></tr>
@endif
<tr><td style="padding-top: 10px;"><strong>Total</strong></td><td align="right" style="padding-top: 10px;"><strong>{{ Illuminate\Support\Number::currency($order->total_cents / 100, in: $order->currency) }}</strong></td></tr>
</table>

## Customer details

{{ $order->customer_first_name }} {{ $order->customer_last_name }}  
{{ $order->customer_email }}  
@if ($order->customer_phone)
{{ $order->customer_phone }}
@endif

## Shipping address

{{ $order->shipping_street_address }}  
@if ($order->shipping_address_line_two)
{{ $order->shipping_address_line_two }}  
@endif
{{ $order->shipping_city }}, {{ $order->shipping_postal_code }}  
{{ $order->shipping_country_code }}

@if ($order->customer_note)
## Order note

{{ $order->customer_note }}
@endif

If you have any questions, reply to this email and include your order number.

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
