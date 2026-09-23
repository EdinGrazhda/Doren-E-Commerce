---
paths:
  - '{bootstrap/app.php,app/Actions/Images/**,resources/js/lib/product-save-error.ts,resources/js/pages/admin/products/**}'
---

# Pages Admin Products

## Keep product-save diagnostics specific without exposing exceptions
Product-save 5xx responses expose stable codes and an opaque reference that correlates with server-side exception logs, never raw SQL, filesystem paths, or exception messages. Keep HTTP failures separate from network/cancellation/invalid-JSON failures; an unconfirmed write must not be automatically retried.
