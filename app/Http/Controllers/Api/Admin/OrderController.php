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
