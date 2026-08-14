<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;

class CustomerController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $customers = Order::query()
            ->selectRaw('customer_email, max(customer_first_name) as first_name, max(customer_last_name) as last_name, count(*) as orders_count, sum(total_cents) as total_spent_cents, max(created_at) as last_order_at')
            ->groupBy('customer_email')
            ->orderByDesc('last_order_at')
            ->limit(50)
            ->get();

        return response()->json(['data' => ['customers' => $customers]]);
    }
}
