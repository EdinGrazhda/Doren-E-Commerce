---
paths:
  - 'resources/js/pages/admin/products/**,app/Http/Controllers/Api/Admin/ProductController.php,app/Http/Requests/Admin/*ProductRequest.php,resources/js/pages/products/show.tsx'
---

# Products

## Use uploads for product color images
Admin product images are uploaded files, not visible URL fields. Support up to four product gallery uploads; store the first as primary_image_url and the rest in gallery_image_urls. Each color group uses one uploaded image that is stored once and copied to every ProductVariant for that color/size group.
