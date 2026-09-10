---
paths:
  - '{app/Http/Controllers/Api/Admin/{ProductController,StorefrontBannerController}.php,app/Actions/Images/**}'
---

# Images

## Optimize local image uploads as WebP
All new local product, variant gallery, and storefront banner uploads must go through StoreOptimizedImage. It encodes WebP at quality 82 and proportionally caps the longest edge at 2000px; do not store original JPEG/PNG uploads directly.
