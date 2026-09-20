---
paths:
  - resources/js/components/virtual-try-on.tsx
---

# Components

## Keep the fitting room accessible when generation is unavailable
The Try it with AI trigger must still open the dialog when TRY_ON_ENABLED is false or a selected color lacks a garment photo. Allow browser-only photo selection/preview and explain availability inside the dialog; guard and disable only generation, without bypassing backend availability checks.
