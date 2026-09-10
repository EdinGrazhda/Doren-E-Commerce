---
paths:
  - '{app/Models/{Campaign,Product}.php,app/Services/*Campaign*.php,app/Actions/Checkout/**,app/Actions/Campaigns/**,app/Http/Controllers/**/CampaignController.php,resources/js/pages/admin/campaigns/**}'
---

# Campaigns

## Campaign prices are server authoritative
Active product campaigns may not overlap for the same product and time window. ProductCampaignPrice applies campaigns to either base or variant prices. Storefront/cart may display calculated prices, but checkout must always recalculate campaign pricing inside its locked database transaction and persist subtotal, discount, and total.
