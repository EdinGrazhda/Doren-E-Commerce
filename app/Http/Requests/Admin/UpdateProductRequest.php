<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $product = $this->route('product');

        return [
            'product_category_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'required',
                'string',
                'max:255',
                Rule::unique('products', 'slug')->ignore($product instanceof Product ? $product->id : null),
            ],
            'sku' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('products', 'sku')->ignore($product instanceof Product ? $product->id : null),
            ],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'currency' => ['required', 'string', 'size:3'],
            'primary_image_url' => ['nullable', 'url', 'max:2048'],
            'primary_image_upload' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'variants' => ['required', 'array', 'size:5'],
            'variants.*.size' => ['required', 'string', Rule::in(['S', 'M', 'L', 'XL', 'XXL']), 'distinct'],
            'variants.*.color_name' => ['required', 'string', 'max:80'],
            'variants.*.color_hex' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0', 'max:999999'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge([
            'slug' => Str::slug((string) ($this->input('slug') ?: $this->input('name'))),
            'sku' => $this->filled('sku') ? Str::upper((string) $this->input('sku')) : null,
            'currency' => Str::upper((string) ($this->input('currency') ?: 'USD')),
            'product_category_id' => $this->input('product_category_id') ?: null,
            'is_active' => $this->boolean('is_active'),
            'is_featured' => $this->boolean('is_featured'),
            'variants' => collect($this->input('variants', []))
                ->map(fn (array $variant): array => [
                    'size' => Str::upper((string) ($variant['size'] ?? '')),
                    'color_name' => $variant['color_name'] ?? '',
                    'color_hex' => $this->validColorHex($variant['color_hex'] ?? null),
                    'stock_quantity' => $variant['stock_quantity'] ?? 0,
                ])
                ->all(),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function validated($key = null, $default = null): array
    {
        $validated = parent::validated();
        $validated['price_cents'] = $this->moneyToCents($validated['price']);
        $validated['compare_at_price_cents'] = null;

        unset($validated['price']);

        return $validated;
    }

    private function moneyToCents(string|int|float $amount): int
    {
        return (int) round(((float) $amount) * 100);
    }

    private function validColorHex(mixed $colorHex): ?string
    {
        $colorHex = is_string($colorHex) ? $colorHex : null;

        return $colorHex && preg_match('/^#[0-9A-Fa-f]{6}$/', $colorHex) === 1
            ? $colorHex
            : null;
    }
}
