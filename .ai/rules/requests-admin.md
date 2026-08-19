---
paths:
  - '{resources/js/pages/admin/products/**,app/Http/Controllers/Api/Admin/ProductController.php,app/Http/Requests/Admin/*ProductRequest.php}'
---

# Requests Admin

## Manage product variants as color groups
In the admin product form, define each color once and collect stock for every supported size. Submit and persist the result as one ProductVariant per color/size combination; editing must reconstruct color groups and remove variants no longer submitted.
