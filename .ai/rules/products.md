---
paths:
  - 'resources/js/pages/admin/products/**,app/Http/Controllers/Api/Admin/ProductController.php,app/Http/Requests/Admin/*ProductRequest.php,resources/js/pages/products/show.tsx'
---

# Products

## Use uploads for product color images
Admin product images are uploaded files, not visible URL fields. Support up to four product gallery uploads; store the first as primary_image_url and the rest in gallery_image_urls. Each color group uses an uploaded or retained four-image gallery; persist those images through ProductVariantImage rows for every ProductVariant in that color/size group while keeping product_variants.image_url as the first gallery image for compatibility.
