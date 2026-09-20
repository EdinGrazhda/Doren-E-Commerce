---
paths:
  - '{app/Http/Controllers/*TryOn*.php,app/Services/VirtualTryOn*.php,resources/js/components/virtual-try-on.tsx,resources/js/pages/products/show.tsx}'
---

# Js Pages Products

## Local preview may skip garment images
The real service driver must require an actual selected-color garment image. The local-preview driver is only for local/testing UI flow checks, may generate from the uploaded person photo without a garment image, and must stay disabled outside local/testing environments.

## Generation must use real inference
Supersedes the local-preview exception: never enable an upload-copy/local-preview driver as AI generation, including in local development. Only real service inference may complete a customer try-on. Keep browser-only photo preview available when the service is disabled; require selected-color garment images and queue real generation.
