<?php

namespace App\Http\Controllers;

use App\Actions\Checkout\CreateCheckoutOrder;
use App\Http\Requests\StoreCheckoutRequest;
use App\Models\Order;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class CheckoutController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('checkout', $this->cartPayload());
    }

    public function store(StoreCheckoutRequest $request, CreateCheckoutOrder $createCheckoutOrder): RedirectResponse
    {
        try {
            $order = $createCheckoutOrder->execute($request->validated(), session('cart.items', []));
        } catch (RuntimeException $exception) {
            return back()->withErrors(['cart' => $exception->getMessage()]);
        }

        $request->session()->forget('cart.items');

        return to_route('checkout.thank-you', ['order' => $order->order_number]);
    }

    public function thankYou(Order $order): Response
    {
        return Inertia::render('checkout/thank-you', [
            'order' => [
                'order_number' => $order->order_number,
                'customer_email' => $order->customer_email,
                'total_cents' => $order->total_cents,
                'currency' => $order->currency,
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function cartPayload(): array
    {
        $items = collect(session('cart.items', []))
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

        return [
            'items' => $items,
            'subtotal_cents' => $items->sum('line_total_cents'),
            'currency' => $items->first()['currency'] ?? 'USD',
        ];
    }
}
