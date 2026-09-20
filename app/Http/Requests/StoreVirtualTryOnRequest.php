<?php

namespace App\Http\Requests;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;

class StoreVirtualTryOnRequest extends FormRequest
{
    public function authorize(): bool
    {
        $product = $this->route('product');

        return $product instanceof Product && $product->is_active;
    }

    /** @return array<string, mixed> */
    public function rules(): array
    {
        return [
            'product_variant_id' => ['required', 'integer'],
            'photo' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240', 'dimensions:min_width=384,min_height=512,max_width=6000,max_height=6000'],
            'consent' => ['accepted'],
        ];
    }

    /** @return array<string, string> */
    public function messages(): array
    {
        return [
            'photo.dimensions' => 'Use a clear full-body photo at least 384 × 512 pixels, and no larger than 6000 × 6000 pixels.',
            'photo.max' => 'Choose a photo smaller than 10 MB.',
            'consent.accepted' => 'Please confirm you have permission to use this photo.',
        ];
    }
}
