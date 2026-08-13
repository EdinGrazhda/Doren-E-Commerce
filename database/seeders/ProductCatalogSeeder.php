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
            [
                'category_slug' => 'polos',
                'name' => 'Organic Cotton Polo',
                'slug' => 'organic-cotton-polo',
                'sku' => 'DRN-POLO-ORGANIC',
                'description' => 'A timeless organic cotton polo with a structured collar and soft hand feel.',
                'price_cents' => 8800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1586363104862-3a5e2ab60d99?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 50,
                'variants' => $this->variants('DRN-POLO-ORGANIC', ['Olive Green' => '#4e5738', 'Ecru' => '#e8dfcf', 'Black' => '#151515']),
            ],
            [
                'category_slug' => 'polos',
                'name' => 'Ribbed Collar Polo',
                'slug' => 'ribbed-collar-polo',
                'sku' => 'DRN-POLO-RIB',
                'description' => 'A compact cotton polo finished with ribbed trims for a clean weekend profile.',
                'price_cents' => 9400,
                'primary_image_url' => 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 60,
                'variants' => $this->variants('DRN-POLO-RIB', ['Navy' => '#182739', 'Sage' => '#8a9674', 'White' => '#f7f4ee']),
            ],
            [
                'category_slug' => 'polos',
                'name' => 'Textured Knit Polo',
                'slug' => 'textured-knit-polo',
                'sku' => 'DRN-POLO-KNIT',
                'description' => 'A refined knit polo with subtle texture and an easy resort-inspired drape.',
                'price_cents' => 10900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 70,
                'variants' => $this->variants('DRN-POLO-KNIT', ['Cream' => '#eee4d1', 'Forest' => '#23382a', 'Slate' => '#59616a']),
            ],
            [
                'category_slug' => 'polos',
                'name' => 'Mercerized Jersey Polo',
                'slug' => 'mercerized-jersey-polo',
                'sku' => 'DRN-POLO-JERSEY',
                'description' => 'A smooth mercerized jersey polo designed for dressier everyday wear.',
                'price_cents' => 9800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 80,
                'variants' => $this->variants('DRN-POLO-JERSEY', ['Midnight' => '#111827', 'Taupe' => '#a89985', 'Ivory' => '#f0eadc']),
            ],
            [
                'category_slug' => 'polos',
                'name' => 'Long Sleeve Polo',
                'slug' => 'long-sleeve-polo',
                'sku' => 'DRN-POLO-LS',
                'description' => 'A long sleeve polo cut from soft cotton pique for transitional layering.',
                'price_cents' => 10500,
                'primary_image_url' => 'https://images.unsplash.com/photo-1618517351616-38fb9c5210c6?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 90,
                'variants' => $this->variants('DRN-POLO-LS', ['Heather' => '#b8b3aa', 'Ink' => '#1c2430', 'Burgundy' => '#6b1f2b']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Cashmere V-Neck Sweater',
                'slug' => 'cashmere-v-neck-sweater',
                'sku' => 'DRN-KNIT-CASH-V',
                'description' => 'A soft cashmere V-neck sweater with a lightweight feel and polished neckline.',
                'price_cents' => 18900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 100,
                'variants' => $this->variants('DRN-KNIT-CASH-V', ['Camel' => '#b89464', 'Grey' => '#8f918c', 'Navy' => '#162433']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Cotton Cable Sweater',
                'slug' => 'cotton-cable-sweater',
                'sku' => 'DRN-KNIT-CABLE',
                'description' => 'A breathable cable-knit sweater made from soft cotton yarn.',
                'price_cents' => 13200,
                'primary_image_url' => 'https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 110,
                'variants' => $this->variants('DRN-KNIT-CABLE', ['Ivory' => '#f0eadc', 'Pine' => '#273c2f', 'Stone' => '#d9d0bf']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Fine Gauge Cardigan',
                'slug' => 'fine-gauge-cardigan',
                'sku' => 'DRN-KNIT-CARDIGAN',
                'description' => 'A fine gauge cardigan with a clean button front and compact silhouette.',
                'price_cents' => 14500,
                'primary_image_url' => 'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 120,
                'variants' => $this->variants('DRN-KNIT-CARDIGAN', ['Charcoal' => '#333333', 'Oat' => '#d8c9ad', 'Blue' => '#31475e']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Quarter Zip Knit',
                'slug' => 'quarter-zip-knit',
                'sku' => 'DRN-KNIT-QZIP',
                'description' => 'A quarter zip knit built for easy layering over shirts and tees.',
                'price_cents' => 13900,
                'primary_image_url' => 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 130,
                'variants' => $this->variants('DRN-KNIT-QZIP', ['Black' => '#151515', 'Moss' => '#5d6a44', 'Cream' => '#eee4d1']),
            ],
            [
                'category_slug' => 'knitwear',
                'name' => 'Wool Blend Roll Neck',
                'slug' => 'wool-blend-roll-neck',
                'sku' => 'DRN-KNIT-ROLL',
                'description' => 'A warm wool blend roll neck with a refined rib texture.',
                'price_cents' => 15500,
                'primary_image_url' => 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 140,
                'variants' => $this->variants('DRN-KNIT-ROLL', ['Navy' => '#162433', 'Taupe' => '#a89985', 'Ecru' => '#e8dfcf']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Oxford Button Down Shirt',
                'slug' => 'oxford-button-down-shirt',
                'sku' => 'DRN-SHIRT-OXFORD',
                'description' => 'A classic Oxford button down shirt with a soft collar roll and durable weave.',
                'price_cents' => 10400,
                'primary_image_url' => 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 150,
                'variants' => $this->variants('DRN-SHIRT-OXFORD', ['White' => '#f7f4ee', 'Blue' => '#b8c4ce', 'Pink' => '#e7c4bf']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Linen Resort Shirt',
                'slug' => 'linen-resort-shirt',
                'sku' => 'DRN-SHIRT-RESORT',
                'description' => 'A relaxed linen resort shirt with an open collar and summer-ready texture.',
                'price_cents' => 11200,
                'primary_image_url' => 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 160,
                'variants' => $this->variants('DRN-SHIRT-RESORT', ['Sand' => '#d9cfbd', 'Olive' => '#6a6a5c', 'White' => '#f7f4ee']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Twill Overshirt',
                'slug' => 'twill-overshirt',
                'sku' => 'DRN-SHIRT-OVERSHIRT',
                'description' => 'A sturdy twill overshirt that works as a light jacket or layered shirt.',
                'price_cents' => 12800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 170,
                'variants' => $this->variants('DRN-SHIRT-OVERSHIRT', ['Khaki' => '#9a8f72', 'Navy' => '#162433', 'Ecru' => '#e8dfcf']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Chambray Work Shirt',
                'slug' => 'chambray-work-shirt',
                'sku' => 'DRN-SHIRT-CHAMBRAY',
                'description' => 'A soft chambray work shirt with casual utility and a refined fit.',
                'price_cents' => 10800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1622445275576-721325763afe?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 180,
                'variants' => $this->variants('DRN-SHIRT-CHAMBRAY', ['Indigo' => '#35516a', 'Grey' => '#8f918c', 'Natural' => '#ded3bd']),
            ],
            [
                'category_slug' => 'shirts',
                'name' => 'Brushed Flannel Shirt',
                'slug' => 'brushed-flannel-shirt',
                'sku' => 'DRN-SHIRT-FLANNEL',
                'description' => 'A brushed flannel shirt with a warm hand feel and understated check.',
                'price_cents' => 11500,
                'primary_image_url' => 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 190,
                'variants' => $this->variants('DRN-SHIRT-FLANNEL', ['Forest' => '#23382a', 'Rust' => '#9b4f2f', 'Cream' => '#eee4d1']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Pleated Wool Trousers',
                'slug' => 'pleated-wool-trousers',
                'sku' => 'DRN-TROUSER-WOOL',
                'description' => 'Pleated wool trousers with a tapered leg and refined drape.',
                'price_cents' => 14800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 200,
                'variants' => $this->variants('DRN-TROUSER-WOOL', ['Charcoal' => '#333333', 'Navy' => '#162433', 'Taupe' => '#a89985']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Stretch Chino Trousers',
                'slug' => 'stretch-chino-trousers',
                'sku' => 'DRN-TROUSER-CHINO',
                'description' => 'Clean stretch chinos with a tailored rise and everyday comfort.',
                'price_cents' => 9800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 210,
                'variants' => $this->variants('DRN-TROUSER-CHINO', ['Stone' => '#d9cfbd', 'Olive' => '#6a6a5c', 'Black' => '#151515']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Drawstring Travel Trouser',
                'slug' => 'drawstring-travel-trouser',
                'sku' => 'DRN-TROUSER-TRAVEL',
                'description' => 'A drawstring travel trouser with a tailored look and relaxed comfort.',
                'price_cents' => 11800,
                'primary_image_url' => 'https://images.unsplash.com/photo-1506629905607-d9c297d357b5?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => true,
                'sort_order' => 220,
                'variants' => $this->variants('DRN-TROUSER-TRAVEL', ['Graphite' => '#4a4d4f', 'Khaki' => '#9a8f72', 'Navy' => '#162433']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Cotton Seersucker Trouser',
                'slug' => 'cotton-seersucker-trouser',
                'sku' => 'DRN-TROUSER-SEERSUCKER',
                'description' => 'Light cotton seersucker trousers with a breathable summer texture.',
                'price_cents' => 12400,
                'primary_image_url' => 'https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 230,
                'variants' => $this->variants('DRN-TROUSER-SEERSUCKER', ['Blue' => '#b8c4ce', 'Natural' => '#ded3bd', 'Grey' => '#8f918c']),
            ],
            [
                'category_slug' => 'trousers',
                'name' => 'Relaxed Corduroy Trouser',
                'slug' => 'relaxed-corduroy-trouser',
                'sku' => 'DRN-TROUSER-CORD',
                'description' => 'Relaxed corduroy trousers with soft texture and a modern straight leg.',
                'price_cents' => 11600,
                'primary_image_url' => 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=85',
                'gallery_image_urls' => [],
                'is_featured' => false,
                'sort_order' => 240,
                'variants' => $this->variants('DRN-TROUSER-CORD', ['Brown' => '#6f4e37', 'Olive' => '#6a6a5c', 'Cream' => '#eee4d1']),
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
