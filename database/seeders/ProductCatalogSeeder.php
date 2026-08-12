<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductCategory;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Arr;

class ProductCatalogSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = collect([
            ['name' => 'Polos', 'slug' => 'polos', 'sort_order' => 10],
            ['name' => 'Knitwear', 'slug' => 'knitwear', 'sort_order' => 20],
            ['name' => 'Shirts', 'slug' => 'shirts', 'sort_order' => 30],
            ['name' => 'Trousers', 'slug' => 'trousers', 'sort_order' => 40],
        ])->mapWithKeys(function (array $category): array {
            $model = ProductCategory::updateOrCreate(
                ['slug' => $category['slug']],
                [
                    'name' => $category['name'],
                    'description' => 'Refined '.$category['name'].' for a modern menswear wardrobe.',
                    'sort_order' => $category['sort_order'],
                    'is_visible' => true,
                ],
            );

            return [$category['slug'] => $model];
        });

        foreach ($this->products() as $productData) {
            $product = Product::updateOrCreate(
                ['slug' => $productData['slug']],
                [
                    'product_category_id' => $categories[$productData['category_slug']]->id,
                    'name' => $productData['name'],
                    'sku' => $productData['sku'],
                    'description' => $productData['description'],
                    'price_cents' => $productData['price_cents'],
                    'compare_at_price_cents' => $productData['compare_at_price_cents'] ?? null,
                    'currency' => 'USD',
                    'primary_image_url' => $productData['primary_image_url'],
                    'gallery_image_urls' => $productData['gallery_image_urls'],
                    'is_active' => true,
                    'is_featured' => $productData['is_featured'],
                    'sort_order' => $productData['sort_order'],
                    'published_at' => now(),
                ],
            );

            foreach ($productData['variants'] as $variantData) {
                $product->variants()->updateOrCreate(
                    ['sku' => $variantData['sku']],
                    [
                        ...Arr::except($variantData, ['sku']),
                        'is_active' => true,
                    ],
                );
            }
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function products(): array
    {
        return [
            [
                'category_slug' => 'polos',
                'name' => 'Pima Cotton Polo',
                'slug' => 'pima-cotton-polo',
                'sku' => 'DRN-POLO-PIMA',
                'description' => 'A breathable cotton polo with a clean collar and refined everyday fit.',
                'price_cents' => 8900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 10,
                'variants' => $this->variants('DRN-POLO-PIMA', ['Olive' => '#4e5738', 'Stone' => '#d9cfbd', 'Black' => '#151515']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Merino Crew Knit',
                'slug' => 'merino-crew-knit',
                'sku' => 'DRN-KNIT-CREW',
                'description' => 'Soft merino knitwear built for layering through changing seasons.',
                'price_cents' => 11900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 20,
                'variants' => $this->variants('DRN-KNIT-CREW', ['Navy' => '#162433', 'Stone' => '#d9d0bf']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Cotton Poplin Shirt',
                'slug' => 'cotton-poplin-shirt',
                'sku' => 'DRN-SHIRT-POPLIN',
                'description' => 'A crisp poplin shirt designed for a sharp silhouette and easy movement.',
                'price_cents' => 9900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 30,
                'variants' => $this->variants('DRN-SHIRT-POPLIN', ['White' => '#f7f4ee', 'Blue' => '#b8c4ce']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Tailored Linen Trousers',
                'slug' => 'tailored-linen-trousers',
                'sku' => 'DRN-TROUSER-LINEN',
                'description' => 'Lightweight tailored trousers with a relaxed summer drape.',
                'price_cents' => 12800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1593032465175-481ac7f401f0?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 40,
                'variants' => $this->variants('DRN-TROUSER-LINEN', ['Sand' => '#d9cfbd', 'Olive' => '#6a6a5c']),
            ],
        ];
    }

    /**
     * @param  array<string, string>  $colors
     * @return array<int, array<string, mixed>>
     */
    private function variants(string $baseSku, array $colors): array
    {
        $variants = [];
        $sortOrder = 1;

        foreach ($colors as $colorName => $colorHex) {
            foreach (['S', 'M', 'L', 'XL'] as $size) {
                $variants[] = [
                    'sku' => $baseSku.'-'.$size.'-'.mb_strtoupper($colorName[0]),
                    'size' => $size,
                    'color_name' => $colorName,
                    'color_hex' => $colorHex,
                    'price_cents' => null,
                    'stock_quantity' => 25,
                    'reserved_quantity' => 0,
                    'sort_order' => $sortOrder++,
                ];
            }
        }

        return $variants;
    }
}
