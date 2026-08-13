<?php

namespace App\Http\Requests;

use App\Models\ProductVariant;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreCartItemRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer', Rule::exists('product_variants', 'id')],
            'quantity' => ['required', 'integer', 'min:1', 'max:10'],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $variant = ProductVariant::query()
                    ->with('product:id,name,slug,is_active')
                    ->find($this->integer('product_variant_id'));

                if (! $variant || ! $variant->is_active || ! $variant->product?->is_active) {
                    $validator->errors()->add('product_variant_id', __('This product option is not available.'));

                    return;
                }

                $existingQuantity = collect(session('cart.items', []))
                    ->firstWhere('variant_id', $variant->id)['quantity'] ?? 0;

                if (($existingQuantity + $this->integer('quantity')) > $variant->stock_quantity) {
                    $validator->errors()->add('quantity', __('Only :count items are available for this option.', [
                        'count' => max($variant->stock_quantity - $existingQuantity, 0),
                    ]));
                }
            },
        ];
    }
}
