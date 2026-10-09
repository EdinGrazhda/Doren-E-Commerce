---
paths:
  - '{app/Http/Middleware/HandleInertiaRequests.php,app/Http/Controllers/HomeController.php,resources/js/components/storefront-navigation.tsx,resources/js/pages/{welcome,cart}.tsx,resources/js/pages/products/show.tsx}'
---

# Js Pages Products

## Generate storefront navigation from visible categories
Build storefront navigation links from visible ProductCategory records ordered by sort_order and then id. Keep New In as the only fixed first link; do not restore hard-coded category names. On the homepage, reuse its category query for the navigation prop to avoid a duplicate query.
