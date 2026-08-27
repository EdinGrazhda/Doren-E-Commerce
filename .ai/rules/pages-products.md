---
paths:
  - 'app/Http/Controllers/Api/Admin/ProductController.php,app/Http/Requests/Admin/*ProductRequest.php,app/Models/ProductVariant*.php,resources/js/pages/admin/products/**,resources/js/pages/products/show.tsx'
---

# Pages Products

## Color galleries require four images
Admin product colors must upload or retain at least four images per color group. Persist them as ordered ProductVariantImage rows for every size variant in that color, while keeping product_variants.image_url set to the first gallery image for compatibility. Storefront color swatches should switch the active gallery to that color's images.
