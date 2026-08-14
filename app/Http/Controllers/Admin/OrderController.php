<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class OrderController extends Controller
{
    public function index(Request $request): Response
    {
        $request->session()->put('dashboard.orders_seen_at', now());

        return Inertia::render('admin/orders/index', [
            'dashboard' => [
                'orders' => [
                    'pending_count' => 0,
                ],
            ],
        ]);
    }
}
