<?php

namespace App\Http\Controllers\Api\Admin;

use App\Actions\Inventory\RecordInventoryMovement;
use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreInventoryMovementRequest;
use App\InventoryMovementType;
use App\Models\InventoryMovement;
use App\Models\ProductVariant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class InventoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $search = Str::limit($request->string('search')->trim()->value(), 100, '');
        $status = $request->string('status')->value();
        $status = in_array($status, ['all', 'healthy', 'low', 'out'], true) ? $status : 'all';

        $variants = ProductVariant::query()
            ->select([
                'id',
                'product_id',
                'sku',
                'size',
                'color_name',
                'color_hex',
                'image_url',
                'price_cents',
                'stock_quantity',
                'reserved_quantity',
                'is_active',
                'updated_at',
            ])
            ->with('product:id,name,sku,price_cents,currency,primary_image_url,is_active')
            ->when($search !== '', function ($query) use ($search): void {
                $query->where(function ($query) use ($search): void {
                    $query->where('sku', 'like', "%{$search}%")
                        ->orWhere('color_name', 'like', "%{$search}%")
                        ->orWhereHas('product', fn ($query) => $query->where('name', 'like', "%{$search}%"));
                });
            })
            ->when($status === 'healthy', fn ($query) => $query->where('stock_quantity', '>', 5))
            ->when($status === 'low', fn ($query) => $query->whereBetween('stock_quantity', [1, 5]))
            ->when($status === 'out', fn ($query) => $query->where('stock_quantity', 0))
            ->orderBy('stock_quantity')
            ->orderBy('id')
            ->paginate(15, pageName: 'variant_page')
            ->withQueryString();

        $movements = InventoryMovement::query()
            ->select([
                'id',
                'product_variant_id',
                'user_id',
                'type',
                'quantity',
                'balance_after',
                'unit_amount_cents',
                'product_name',
                'variant_name',
                'sku',
                'reference',
                'note',
                'created_at',
            ])
            ->with('user:id,name')
            ->latest()
            ->paginate(10, pageName: 'movement_page')
            ->withQueryString();

        $metrics = ProductVariant::query()
            ->selectRaw('COUNT(*) as sku_count')
            ->selectRaw('COALESCE(SUM(stock_quantity), 0) as unit_count')
            ->selectRaw('SUM(CASE WHEN stock_quantity BETWEEN 1 AND 5 THEN 1 ELSE 0 END) as low_stock_count')
            ->selectRaw('SUM(CASE WHEN stock_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_count')
            ->firstOrFail();

        $todaySales = InventoryMovement::query()
            ->where('type', InventoryMovementType::Sold)
            ->whereDate('created_at', today())
            ->selectRaw('COALESCE(SUM(quantity), 0) as quantity')
            ->selectRaw('COALESCE(SUM(quantity * unit_amount_cents), 0) as revenue_cents')
            ->firstOrFail();

        return response()->json([
            'data' => [
                'metrics' => [
                    'sku_count' => (int) $metrics->sku_count,
                    'unit_count' => (int) $metrics->unit_count,
                    'low_stock_count' => (int) $metrics->low_stock_count,
                    'out_of_stock_count' => (int) $metrics->out_of_stock_count,
                    'sales_today' => (int) $todaySales->quantity,
                    'revenue_today_cents' => (int) $todaySales->revenue_cents,
                ],
                'variants' => $variants,
                'movements' => $movements,
            ],
        ]);
    }

    public function store(
        StoreInventoryMovementRequest $request,
        RecordInventoryMovement $recordInventoryMovement,
    ): JsonResponse {
        $validated = $request->validated();
        $movement = $recordInventoryMovement->execute(
            user: $request->user(),
            variantId: $validated['product_variant_id'],
            type: InventoryMovementType::from($validated['type']),
            quantity: $validated['quantity'],
            unitAmountCents: $validated['unit_amount_cents'] ?? null,
            reference: $validated['reference'] ?? null,
            note: $validated['note'] ?? null,
        );

        return response()->json([
            'data' => $movement->load('user:id,name'),
            'message' => $movement->type === InventoryMovementType::Received
                ? 'Stock received.'
                : 'Sale recorded.',
        ], 201);
    }
}
