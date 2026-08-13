<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CartController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $items = collect($request->session()->get('cart.items', []))
            ->values()
            ->map(fn (array $item): array => [
                'product_id' => $item['product_id'],
                'variant_id' => $item['variant_id'],
                'name' => $item['name'],
                'slug' => $item['slug'],
                'image_url' => $item['image_url'],
                'size' => $item['size'],
                'color_name' => $item['color_name'],
                'color_hex' => $item['color_hex'],
                'quantity' => $item['quantity'],
                'unit_price_cents' => $item['unit_price_cents'],
                'line_total_cents' => $item['unit_price_cents'] * $item['quantity'],
                'currency' => $item['currency'],
            ]);

        return Inertia::render('cart', [
            'items' => $items,
            'subtotal_cents' => $items->sum('line_total_cents'),
            'currency' => $items->first()['currency'] ?? 'USD',
        ]);
    }
}
