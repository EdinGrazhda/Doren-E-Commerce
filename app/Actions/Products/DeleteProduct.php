<?php

namespace App\Actions\Products;

use App\Models\InventoryMovement;
use App\Models\Product;
use App\Models\ProductVariant;
use App\Models\ProductVariantImage;
use Illuminate\Support\Facades\DB;

class DeleteProduct
{
    public function execute(Product $product): void
    {
        DB::transaction(function () use ($product): void {
            $variantIds = $product->variants()->pluck('id');

            InventoryMovement::query()
                ->whereIn('product_variant_id', $variantIds)
                ->update(['product_variant_id' => null]);

            ProductVariantImage::query()
                ->whereIn('product_variant_id', $variantIds)
                ->delete();

            ProductVariant::query()
                ->whereIn('id', $variantIds)
                ->delete();

            $product->campaigns()->detach();
            $product->delete();
        });
    }
}
