<?php

namespace App\Http\Requests\Admin;

use App\Rules\SafeImageUrl;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

class StoreProductRequest extends FormRequest
{
    private const array Sizes = ['S', 'M', 'L', 'XL', 'XXL'];

    public function authorize(): bool
    {
        return $this->user()?->is_admin === true;
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'product_category_id' => ['nullable', 'integer', Rule::exists('product_categories', 'id')],
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('products', 'slug')],
            'sku' => ['nullable', 'string', 'max:255', Rule::unique('products', 'sku')],
            'description' => ['nullable', 'string', 'max:2000'],
            'price' => ['required', 'numeric', 'min:0', 'max:999999.99'],
            'currency' => ['required', 'string', 'size:3'],
            'primary_image_url' => ['nullable', 'max:2048', new SafeImageUrl],
            'primary_image_upload' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
            'existing_image_urls' => ['nullable', 'array', 'max:4'],
            'existing_image_urls.*' => ['nullable', 'max:2048', new SafeImageUrl],
            'image_uploads' => ['nullable', 'array', 'max:4'],
            'image_uploads.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
            'color_image_uploads' => ['nullable', 'array', 'max:20'],
            'color_image_uploads.*' => ['nullable', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
            'is_active' => ['required', 'boolean'],
            'is_featured' => ['required', 'boolean'],
            'variants' => ['required', 'array', 'min:5', 'max:100'],
            'variants.*.size' => ['required', 'string', Rule::in(self::Sizes)],
            'variants.*.color_name' => ['required', 'string', 'max:80'],
            'variants.*.color_hex' => ['nullable', 'string', 'regex:/^#[0-9A-Fa-f]{6}$/'],
            'variants.*.image_url' => ['nullable', 'max:2048', new SafeImageUrl],
            'variants.*.color_image_upload_index' => ['nullable', 'integer', 'min:0', 'max:19'],
            'variants.*.stock_quantity' => ['required', 'integer', 'min:0', 'max:999999'],
        ];
    }

    /**
     * @return array<int, callable(Validator): void>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $variants = collect($this->input('variants', []));
                $variantKeys = $variants->map(fn (array $variant): string => Str::lower(Str::squish((string) ($variant['color_name'] ?? '')))
                    .'|'.Str::upper((string) ($variant['size'] ?? ''))
                );

                if ($variantKeys->duplicates()->isNotEmpty()) {
                    $validator->errors()->add('variants', 'Each color and size combination must be unique.');
                }

                $variants
                    ->groupBy(fn (array $variant): string => Str::lower(
                        Str::squish((string) ($variant['color_name'] ?? '')),
                    ))
                    ->each(function ($colorVariants) use ($validator): void {
                        $sizes = $colorVariants->pluck('size')->map(
                            fn (mixed $size): string => Str::upper((string) $size),
                        );

                        if ($sizes->sort()->values()->all() !== collect(self::Sizes)->sort()->values()->all()) {
                            $validator->errors()->add('variants', 'Each color must include stock for S, M, L, XL, and XXL.');
                        }

                        if ($colorVariants->pluck('color_hex')->unique()->count() > 1) {
                            $validator->errors()->add('variants', 'Each color must use one swatch value across every size.');
                        }

                        if ($colorVariants->pluck('image_url')->unique()->count() > 1) {
                            $validator->errors()->add('variants', 'Each color must use one product image across every size.');
                        }
                    });
            },
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
            'existing_image_urls' => collect($this->input('existing_image_urls', []))
                ->map(fn (mixed $imageUrl): ?string => $this->nullableString($imageUrl))
                ->filter()
                ->take(4)
                ->values()
                ->all(),
            'variants' => collect($this->input('variants', []))
                ->map(fn (array $variant, int $index): array => [
                    'size' => Str::upper((string) ($variant['size'] ?? '')),
                    'color_name' => Str::squish((string) ($variant['color_name'] ?? '')),
                    'color_hex' => $this->normalizeColorHex($variant['color_hex'] ?? null),
                    'image_url' => $this->nullableString($variant['image_url'] ?? null),
                    'color_image_upload_index' => $variant['color_image_upload_index'] ?? null,
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

    private function normalizeColorHex(mixed $colorHex): ?string
    {
        if (! is_string($colorHex) || trim($colorHex) === '') {
            return null;
        }

        return Str::upper(trim($colorHex));
    }

    private function nullableString(mixed $value): ?string
    {
        if (! is_string($value) || trim($value) === '') {
            return null;
        }

        return trim($value);
    }
}
