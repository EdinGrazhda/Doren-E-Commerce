---
paths:
  - '{app/Actions/Checkout/**,app/Http/Controllers/CheckoutController.php,app/Mail/**,resources/views/mail/**}'
---

# Mail

## Queue customer order confirmations after commit
Successful storefront checkout queues OrderConfirmation to the submitted customer_email only after the order transaction commits. Snapshot the selected product image URL in order_items.product_options so queued emails remain historically accurate when catalog images change.
