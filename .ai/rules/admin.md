---
paths:
  - '{routes/{web,api}.php,app/Http/Controllers/{Admin,Api/Admin}/**,resources/js/pages/admin/**}'
---

# Admin

## Keep admin pages and JSON endpoints separate
Admin Inertia page shells stay under authenticated, verified, admin-protected /dashboard routes in web.php. Admin data and mutations live under /api/admin with auth:sanctum, verified, admin, and throttle:api middleware. Admin React pages call those API routes through Wayfinder and Inertia useHttp; do not restore admin mutations to web.php.
