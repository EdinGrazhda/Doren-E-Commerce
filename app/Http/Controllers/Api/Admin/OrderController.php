<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\OrderStatus;
use App\PaymentStatus;
use Illuminate\Http\JsonResponse;

class OrderController extends Controller
{
    public function index(): JsonResponse
    {
        $orders = Order::query()
            ->select([
                'id',
                'order_number',
                'status',
                'payment_status',
                'customer_first_name',
                'customer_last_name',
                'customer_email',
                'shipping_city',
                'total_cents',
                'currency',
                'created_at',
            ])
            ->withCount('items')
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => [
                'orders' => $orders,
                'statusOptions' => collect(OrderStatus::cases())->map(fn (OrderStatus $status): array => [
                    'label' => $status->name,
                    'value' => $status->value,
                ]),
                'paymentStatusOptions' => collect(PaymentStatus::cases())->map(fn (PaymentStatus $status): array => [
                    'label' => $status->name,
                    'value' => $status->value,
                ]),
            ],
        ]);
    }

    public function show(Order $order): JsonResponse
    {
        $order->load('items');

        return response()->json([
            'data' => [
                'id' => $order->id,
                'order_number' => $order->order_number,
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
                'customer_first_name' => $order->customer_first_name,
                'customer_last_name' => $order->customer_last_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'shipping_city' => $order->shipping_city,
                'shipping_street_address' => $order->shipping_street_address,
                'shipping_address_line_two' => $order->shipping_address_line_two,
                'shipping_postal_code' => $order->shipping_postal_code,
                'shipping_country_code' => $order->shipping_country_code,
                'customer_note' => $order->customer_note,
                'subtotal_cents' => $order->subtotal_cents,
                'shipping_cents' => $order->shipping_cents,
                'tax_cents' => $order->tax_cents,
                'discount_cents' => $order->discount_cents,
                'total_cents' => $order->total_cents,
                'currency' => $order->currency,
                'placed_at' => $order->placed_at,
                'created_at' => $order->created_at,
                'items' => $order->items->map(fn ($item): array => [
                    'id' => $item->id,
                    'product_name' => $item->product_name,
                    'variant_name' => $item->variant_name,
                    'sku' => $item->sku,
                    'unit_price_cents' => $item->unit_price_cents,
                    'quantity' => $item->quantity,
                    'line_total_cents' => $item->line_total_cents,
                    'currency' => $item->currency,
                    'product_options' => $item->product_options,
                ])->values(),
            ],
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): JsonResponse
    {
        $order->update($request->validated());

        return response()->json([
            'data' => $order->fresh(),
            'message' => 'Order updated.',
        ]);
    }

    public function destroy(Order $order): JsonResponse
    {
        $order->delete();

        return response()->json(['message' => 'Order deleted.']);
    }
}
