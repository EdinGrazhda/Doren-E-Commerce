---
paths:
  - 'resources/js/pages/admin/products/**'
---

# Admin Products

## Index nested multipart collections
When a useHttp submission contains files, nested arrays of objects must be transformed to numeric-keyed records before submission. Inertia useHttp otherwise emits fields such as variants[][color_name], which PHP splits into separate incomplete variants; explicit keys produce variants[0][color_name]. Preserve numeric keys for color_image_uploads so upload indices remain aligned.
