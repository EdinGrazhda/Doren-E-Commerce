<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdateOrderRequest;
use App\Models\Order;
use App\OrderStatus;
use App\PaymentStatus;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(): Response
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

        return Inertia::render('admin/orders/index', [
            'orders' => $orders,
            'statusOptions' => collect(OrderStatus::cases())->map(fn (OrderStatus $status): array => [
                'label' => $status->name,
                'value' => $status->value,
            ]),
            'paymentStatusOptions' => collect(PaymentStatus::cases())->map(fn (PaymentStatus $status): array => [
                'label' => $status->name,
                'value' => $status->value,
            ]),
        ]);
    }

    public function update(UpdateOrderRequest $request, Order $order): RedirectResponse
    {
        $order->update($request->validated());

        return to_route('dashboard.orders.index');
    }

    public function destroy(Order $order): RedirectResponse
    {
        $order->delete();

        return to_route('dashboard.orders.index');
    }
}
