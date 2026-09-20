---
paths:
  - '{app/Jobs/GenerateVirtualTryOn.php,app/Services/VirtualTryOn*.php,resources/python/try_on/**}'
---

# Try On

## Run virtual try-on on a separate private GPU service
FASHN runs as one warm Python process per GPU. Laravel uses the dedicated try-ons database queue (270s timeout, 360s retry_after); never run generation in a web request or on the default queue. Customer photos/results stay on the private try-ons disk with session ownership; schedule try-ons:prune every five minutes. Use actual selected-color images; do not use storefront placeholders or another color as a fallback. Enable only after model weights, private service token, queue worker, scheduler and real GPU smoke tests are ready.
