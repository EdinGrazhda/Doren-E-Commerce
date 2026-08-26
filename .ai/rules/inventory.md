---
paths:
  - '{app/Actions/Inventory/**,app/Http/Controllers/Api/Admin/InventoryController.php,resources/js/pages/admin/inventory/**}'
---

# Inventory

## Keep product variants as the inventory source of truth
Manual receipts and counter sales must go through RecordInventoryMovement. Lock the ProductVariant row, update stock_quantity, and create the InventoryMovement ledger entry in one database transaction. Sales may only consume stock_quantity minus reserved_quantity.
