# Graph Report - doren  (2026-08-26)

## Corpus Check
- 287 files · ~211,856 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1545 nodes · 2859 edges · 170 communities (117 shown, 53 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 26 edges (avg confidence: 0.74)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `3d37eb93`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mail Best Practices
- Illuminate\Http\JsonResponse
- admin-sidebar.tsx
- scripts
- AGENTS.md
- Inertia React Development
- @laravel/passkeys
- button.tsx
- utils.ts
- dropdown-menu.tsx
- Product
- cn
- Pest 5 Features
- compilerOptions
- ProductVariant
- User.php
- components.json
- Laravel Fortify Development
- categories/index.tsx
- auth.ts
- devDependencies
- Tailwind CSS Development
- SafeActionUrl
- banners/index.tsx
- Controller
- Admin
- optionalDependencies
- Detection Checklist
- Process
- Architecture Best Practices
- Security Best Practices
- index.md
- require-dev
- cart.tsx
- Queue & Job Best Practices
- tw-animate-css
- SafeImageUrl
- admin/dashboard.tsx
- Advanced Query Patterns
- Database Performance Best Practices
- Events & Notifications Best Practices
- Wayfinder Development
- Caching Best Practices
- Eloquent Best Practices
- Migration Best Practices
- user-info.tsx
- dependencies
- scripts
- Blade & Views Best Practices
- Error Handling Best Practices
- Task Scheduling Best Practices
- Testing Best Practices
- composer.json
- require
- Collection Best Practices
- HTTP Client Best Practices
- ProductVariant.php
- Routing & Controllers Best Practices
- Conventions & Style
- Validation & Forms Best Practices
- config
- PasswordValidationRules.php
- @radix-ui/react-checkbox
- welcome.tsx
- StoreProductRequest
- inventory/index.tsx
- @radix-ui/react-navigation-menu
- TestCase
- psr-4
- laravel
- concurrently
- placeholder-pattern.tsx
- show.tsx
- input-otp
- autoload-dev
- keywords
- eslint.config.js
- icon.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- UpdateProductRequest
- Admin Products
- @radix-ui/react-select
- products/index.tsx
- Requests Admin
- toggle-group.tsx
- checkout.tsx
- @radix-ui/react-avatar
- Order
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- lucide-react
- @inertiajs/react
- Illuminate\Foundation\Http\FormRequest
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- index.ts
- react-dom
- sonner
- tailwind-merge
- breadcrumbs.tsx
- ProfileValidationRules.php
- two-factor-setup-modal.tsx
- typescript
- vite
- @vitejs/plugin-react
- Illuminate\Contracts\Validation\ValidationRule
- laravel-best-practices/SKILL.md
- app-header.tsx
- thank-you.tsx
- ProductCategory
- package.json
- Inventory
- Product.php
- @eslint/js
- Products
- RTK - Rust Token Killer
- eslint-plugin-import
- @radix-ui/react-collapsible
- eslint-plugin-react
- eslint-plugin-react-hooks
- globals
- @radix-ui/react-label
- @radix-ui/react-toggle
- react
- tailwindcss
- @tailwindcss/vite
- @types/react
- @types/react-dom
- prettier-plugin-tailwindcss
- @stylistic/eslint-plugin
- @types/node

## God Nodes (most connected - your core abstractions)
1. `cn()` - 129 edges
2. `Controller` - 44 edges
3. `Button()` - 29 edges
4. `Product` - 25 edges
5. `ProductCategory` - 25 edges
6. `useAdminApi()` - 19 edges
7. `Order` - 18 edges
8. `User` - 18 edges
9. `Input()` - 17 edges
10. `Label()` - 16 edges

## Surprising Connections (you probably didn't know these)
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/breadcrumb.tsx → resources/js/lib/utils.ts
- `DialogOverlay()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dialog.tsx → resources/js/lib/utils.ts
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Communities (170 total, 53 thin omitted)

### Community 0 - "Mail Best Practices"
Cohesion: 0.29
Nodes (6): Implement `ShouldQueue` on the Mailable Class, Mail Best Practices, Separate Content Tests from Sending Tests, Use `afterCommit()` on Mailables Inside Transactions, Use `assertQueued()` Not `assertSent()` for Queued Mailables, Use Markdown Mailables for Transactional Emails

### Community 1 - "Illuminate\Http\JsonResponse"
Cohesion: 0.14
Nodes (7): CustomerController, StorefrontBannerController, StoreSettingController, StoreStorefrontBannerRequest, UpdateStorefrontBannerRequest, StorefrontBanner, Illuminate\Http\JsonResponse

### Community 2 - "admin-sidebar.tsx"
Cohesion: 0.18
Nodes (18): AdminNavSection, adminNavSections, AppLogo(), footerNavItems, mainNavItems, NavFooter(), NavMain(), NavUser() (+10 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (40): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+32 more)

### Community 4 - "AGENTS.md"
Cohesion: 0.05
Nodes (38): APIs & Eloquent Resources, Application Structure & Architecture, Artisan, Avoid RTK For, Command Usage, Conventions, Deployment, Do Things the Laravel Way (+30 more)

### Community 5 - "Inertia React Development"
Cohesion: 0.07
Nodes (27): Basic Link Component, Basic Usage, Client-Side Navigation, Common Pitfalls, Deferred Props, Documentation, Form Component (Recommended), Form Component Reset Props (+19 more)

### Community 7 - "button.tsx"
Cohesion: 0.11
Nodes (22): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, PasskeyItem(), PasskeyRegistration(), Props (+14 more)

### Community 8 - "utils.ts"
Cohesion: 0.23
Nodes (11): AdminSidebar(), AppHeader(), Separator(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn, WhenCurrentUrlFn (+3 more)

### Community 9 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 10 - "Product"
Cohesion: 0.20
Nodes (4): ProductController, HomeController, ProductShowController, Product

### Community 11 - "cn"
Cohesion: 0.14
Nodes (25): CardFooter(), SheetDescription(), Sidebar(), SidebarContext, SidebarGroupAction(), SidebarGroupContent(), SidebarInput(), SidebarInset() (+17 more)

### Community 12 - "Pest 5 Features"
Cohesion: 0.10
Nodes (19): Architecture Testing, Assertions, Basic Test Structure, Basic Usage, Browser Test Example, Common Pitfalls, Creating Tests, Datasets (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 14 - "ProductVariant"
Cohesion: 0.15
Nodes (4): ProductVariant, InventoryMovementFactory, static, Illuminate\Database\Eloquent\Relations\HasMany

### Community 15 - "User.php"
Cohesion: 0.08
Nodes (12): ResetUserPassword, User, AppServiceProvider, FortifyServiceProvider, Illuminate\Contracts\Auth\MustVerifyEmail, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Illuminate\Support\ServiceProvider (+4 more)

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "Laravel Fortify Development"
Cohesion: 0.12
Nodes (16): Available Features, Best Practices, Custom Authentication Logic, Documentation, Email Verification Setup, Key Endpoints, Laravel Fortify Development, Passkeys Setup (+8 more)

### Community 18 - "categories/index.tsx"
Cohesion: 0.23
Nodes (14): Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay() (+6 more)

### Community 19 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 21 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-prettier (+7 more)

### Community 22 - "Tailwind CSS Development"
Cohesion: 0.14
Nodes (13): Basic Usage, Common Patterns, Common Pitfalls, CSS-First Configuration, Dark Mode, Documentation, Flexbox Layout, Grid Layout (+5 more)

### Community 24 - "banners/index.tsx"
Cohesion: 0.12
Nodes (23): AdminPagination(), AdminPaginationMeta, AdminPaginationProps, pageNumbers(), pageUrl(), Select(), SelectContent(), SelectItem() (+15 more)

### Community 25 - "Controller"
Cohesion: 0.05
Nodes (27): CustomerController, DashboardController, InventoryController, OrderController, ProductCategoryController, ProductController, SalesController, StorefrontBannerController (+19 more)

### Community 27 - "optionalDependencies"
Cohesion: 0.15
Nodes (13): lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, optionalDependencies, lightningcss-linux-x64-gnu, lightningcss-win32-x64-msvc, @rollup/rollup-linux-x64-gnu, @rollup/rollup-win32-x64-msvc, @tailwindcss/oxide-linux-x64-gnu (+5 more)

### Community 29 - "Detection Checklist"
Cohesion: 0.17
Nodes (11): A. Validation & HTTP input, B. Controllers & routing, C. Authorization, D. Eloquent & models, Detection Checklist, E. Architecture & organization, F. Frontend & views, G. Database & migrations (+3 more)

### Community 30 - "Process"
Cohesion: 0.17
Nodes (11): Edge cases, Glob mapping, Ground Rules (read before you start), Infer Conventions, Process, Step 0: Orient, Step 1: Predefined sweep, Step 2: Open-ended pass (+3 more)

### Community 31 - "Architecture Best Practices"
Cohesion: 0.17
Nodes (11): Architecture Best Practices, Code to Interfaces, Convention Over Configuration, Default Sort by Descending, Single-Purpose Action Classes, Use Atomic Locks for Race Conditions, Use `Concurrency::run()` for Parallel Execution, Use `Context` for Request-Scoped Data (+3 more)

### Community 32 - "Security Best Practices"
Cohesion: 0.17
Nodes (11): Audit Dependencies, Authorize Every Action, CSRF Protection, Encrypt Sensitive Database Fields, Escape Output to Prevent XSS, Keep Secrets Out of Code, Mass Assignment Protection, Prevent SQL Injection (+3 more)

### Community 34 - "require-dev"
Cohesion: 0.17
Nodes (12): require-dev, fakerphp/faker, larastan/larastan, laravel/boost, laravel/pail, laravel/pao, laravel/pint, laravel/sail (+4 more)

### Community 35 - "cart.tsx"
Cohesion: 0.50
Nodes (4): Cart(), CartItem, formatPrice(), Props

### Community 36 - "Queue & Job Best Practices"
Cohesion: 0.18
Nodes (10): Always Implement `failed()`, Batch Related Jobs, Implement `ShouldBeUnique`, Queue & Job Best Practices, Rate Limit External API Calls in Jobs, `retryUntil()` Needs `$tries = 0`, Set `retry_after` Greater Than `timeout`, Use Exponential Backoff (+2 more)

### Community 39 - "admin/dashboard.tsx"
Cohesion: 0.12
Nodes (31): AdminApiState(), Props, Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+23 more)

### Community 40 - "Advanced Query Patterns"
Cohesion: 0.20
Nodes (9): Advanced Query Patterns, Create Dynamic Relationships via Subquery FK, Prefer `whereIn` + Subquery Over `whereHas`, Sometimes Two Simple Queries Beat One Complex Query, Use `addSelect()` Subqueries for Single Values from Has-Many, Use Compound Indexes Matching `orderBy` Column Order, Use Conditional Aggregates Instead of Multiple Count Queries, Use Correlated Subqueries for Has-Many Ordering (+1 more)

### Community 41 - "Database Performance Best Practices"
Cohesion: 0.20
Nodes (9): Add Database Indexes, Always Eager Load Relationships, Chunk Large Datasets, Database Performance Best Practices, No Queries in Blade Templates, Prevent Lazy Loading in Development, Select Only Needed Columns, Use `cursor()` for Memory-Efficient Iteration (+1 more)

### Community 42 - "Events & Notifications Best Practices"
Cohesion: 0.20
Nodes (9): Always Queue Notifications, Events & Notifications Best Practices, Implement `HasLocalePreference` on Notifiable Models, Rely on Event Discovery, Route Notification Channels to Dedicated Queues, Run `event:cache` in Production Deploy, Use `afterCommit()` on Notifications in Transactions, Use On-Demand Notifications for Non-User Recipients (+1 more)

### Community 43 - "Wayfinder Development"
Cohesion: 0.20
Nodes (9): Common Methods, Common Pitfalls, Documentation, Generate Routes, Import Patterns, Quick Reference, Verification, Wayfinder Development (+1 more)

### Community 45 - "Caching Best Practices"
Cohesion: 0.22
Nodes (8): Caching Best Practices, Configure Failover Cache Stores in Production, Use `Cache::add()` for Atomic Conditional Writes, Use `Cache::flexible()` for Stale-While-Revalidate, Use `Cache::memo()` to Avoid Redundant Hits Within a Request, Use `Cache::remember()` Instead of Manual Get/Put, Use Cache Tags to Invalidate Related Groups, Use `once()` for Per-Request Memoization

### Community 46 - "Eloquent Best Practices"
Cohesion: 0.22
Nodes (8): Apply Global Scopes Sparingly, Avoid Hardcoded Table Names in Queries, Cast Date Columns Properly, Define Attribute Casts, Eloquent Best Practices, Use Correct Relationship Types, Use Local Scopes for Reusable Queries, Use `whereBelongsTo()` for Relationship Queries

### Community 47 - "Migration Best Practices"
Cohesion: 0.22
Nodes (8): Add Indexes in the Migration, Generate Migrations with Artisan, Keep Migrations Focused, Migration Best Practices, Mirror Defaults in Model `$attributes`, Never Modify Deployed Migrations, Use `constrained()` for Foreign Keys, Write Reversible `down()` Methods by Default

### Community 48 - "user-info.tsx"
Cohesion: 0.33
Nodes (7): Avatar(), AvatarFallback(), AvatarImage(), UserInfo(), getInitial(), GetInitialsFn, useInitials()

### Community 49 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, clsx, @inertiajs/vite, laravel-vite-plugin, dependencies, class-variance-authority, clsx, @inertiajs/vite (+1 more)

### Community 50 - "scripts"
Cohesion: 0.22
Nodes (9): scripts, build, build:ssr, dev, format, format:check, lint, lint:check (+1 more)

### Community 51 - "Blade & Views Best Practices"
Cohesion: 0.25
Nodes (7): Blade & Views Best Practices, Prefer Blade Components Over `@include`, Use `$attributes->merge()` in Component Templates, Use `@aware` for Deeply Nested Component Props, Use Blade Fragments for Partial Re-Renders (htmx/Turbo), Use `@pushOnce` for Per-Component Scripts, Use View Composers for Shared View Data

### Community 52 - "Error Handling Best Practices"
Cohesion: 0.25
Nodes (7): Add Context to Exception Classes, Enable `dontReportDuplicates()`, Error Handling Best Practices, Exception Reporting and Rendering, Force JSON Error Rendering for API Routes, Throttle High-Volume Exceptions, Use `ShouldntReport` for Exceptions That Should Never Log

### Community 53 - "Task Scheduling Best Practices"
Cohesion: 0.25
Nodes (7): Task Scheduling Best Practices, Use `environments()` to Restrict Tasks, Use `onOneServer()` on Multi-Server Deployments, Use `runInBackground()` for Concurrent Long Tasks, Use Schedule Groups for Shared Configuration, Use `takeUntilTimeout()` for Time-Bounded Processing, Use `withoutOverlapping()` on Variable-Duration Tasks

### Community 54 - "Testing Best Practices"
Cohesion: 0.25
Nodes (7): Call `Event::fake()` After Factory Setup, Testing Best Practices, Use `Exceptions::fake()` to Assert Exception Reporting, Use Factory States and Sequences, Use `LazilyRefreshDatabase` Over `RefreshDatabase`, Use Model Assertions Over Raw Database Assertions, Use `recycle()` to Share Relationship Instances Across Factories

### Community 55 - "composer.json"
Cohesion: 0.25
Nodes (7): description, license, minimum-stability, name, prefer-stable, $schema, type

### Community 56 - "require"
Cohesion: 0.22
Nodes (9): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/sanctum, laravel/tinker, laravel/wayfinder (+1 more)

### Community 57 - "Collection Best Practices"
Cohesion: 0.29
Nodes (6): Choose `cursor()` vs. `lazy()` Correctly, Collection Best Practices, Use `#[CollectedBy]` for Custom Collection Classes, Use Higher-Order Messages for Simple Operations, Use `lazyById()` When Updating Records While Iterating, Use `toQuery()` for Bulk Operations on Collections

### Community 58 - "HTTP Client Best Practices"
Cohesion: 0.29
Nodes (6): Always Set Explicit Timeouts, Fake HTTP Calls in Tests, Handle Errors Explicitly, HTTP Client Best Practices, Use Request Pooling for Concurrent Requests, Use Retry with Backoff for External APIs

### Community 59 - "ProductVariant.php"
Cohesion: 0.15
Nodes (8): RecordInventoryMovement, InventoryController, InventoryMovement, OrderItem, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo, InventoryMovementType

### Community 60 - "Routing & Controllers Best Practices"
Cohesion: 0.29
Nodes (6): Keep Controllers Thin, Routing & Controllers Best Practices, Type-Hint Form Requests, Use Implicit Route Model Binding, Use Resource Controllers, Use Scoped Bindings for Nested Resources

### Community 61 - "Conventions & Style"
Cohesion: 0.29
Nodes (6): Conventions & Style, Follow Laravel Naming Conventions, No Inline JS/CSS in Blade, No Unnecessary Comments, Prefer Shorter Readable Syntax, Use Laravel String & Array Helpers

### Community 62 - "Validation & Forms Best Practices"
Cohesion: 0.29
Nodes (6): Always Use `validated()`, Array vs. String Notation for Rules, Use Form Request Classes, Use `Rule::when()` for Conditional Validation, Use the `after()` Method for Custom Validation, Validation & Forms Best Practices

### Community 63 - "config"
Cohesion: 0.29
Nodes (7): pestphp/pest-plugin, php-http/discovery, config, allow-plugins, optimize-autoloader, preferred-install, sort-packages

### Community 64 - "PasswordValidationRules.php"
Cohesion: 0.27
Nodes (3): CreateNewUser, ProfileDeleteRequest, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 66 - "welcome.tsx"
Cohesion: 0.13
Nodes (19): bannerTitleLines(), benefits, categoryHref(), fallbackImages, footerColumns, formatPrice(), imageFor(), navigationItems (+11 more)

### Community 68 - "inventory/index.tsx"
Cohesion: 0.15
Nodes (15): Badge(), badgeVariants, AdminInventoryIndex(), emptyMovement, formatDateTime(), InventoryData, InventoryMetrics, InventoryMovement (+7 more)

### Community 71 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 72 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 75 - "show.tsx"
Cohesion: 0.21
Nodes (13): fallbackImages, formatPrice(), imageFor(), navigationItems, Product, ProductColor, ProductTile(), ProductVariantOption (+5 more)

### Community 78 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 79 - "keywords"
Cohesion: 0.67
Nodes (3): keywords, framework, laravel

### Community 94 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.14
Nodes (7): OrderItemFactory, ProductCategoryFactory, ProductVariantFactory, StorefrontBannerFactory, static, UserFactory, Illuminate\Database\Eloquent\Factories\Factory

### Community 100 - "products/index.tsx"
Cohesion: 0.16
Nodes (16): Checkbox(), AdminProductsIndex(), CategoryOption, centsToPrice(), colorsFromVariants(), makeEmptyColor(), makeEmptyProduct(), Product (+8 more)

### Community 103 - "toggle-group.tsx"
Cohesion: 0.43
Nodes (5): ToggleGroup(), ToggleGroupContext, ToggleGroupItem(), Toggle(), toggleVariants

### Community 104 - "checkout.tsx"
Cohesion: 0.38
Nodes (6): CartItem, Checkout(), CheckoutForm, fieldLabel(), formatPrice(), Props

### Community 106 - "Order"
Cohesion: 0.13
Nodes (8): CreateCheckoutOrder, DashboardController, OrderController, UpdateOrderRequest, Order, OrderFactory, productPayload(), variantsPayload()

### Community 112 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.15
Nodes (6): StoreInventoryMovementRequest, PasswordUpdateRequest, TwoFactorAuthenticationRequest, StoreCartItemRequest, Illuminate\Foundation\Http\FormRequest, Laravel\Fortify\InteractsWithTwoFactorState

### Community 117 - "index.ts"
Cohesion: 0.07
Nodes (36): AppContent(), Props, AppLogoIcon(), AppShell(), Props, AppSidebar(), AppSidebarHeader(), AppearanceToggleTab() (+28 more)

### Community 122 - "breadcrumbs.tsx"
Cohesion: 0.33
Nodes (8): Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator()

### Community 124 - "ProfileValidationRules.php"
Cohesion: 0.36
Nodes (4): emailRules(), nameRules(), profileRules(), ProfileUpdateRequest

### Community 125 - "two-factor-setup-modal.tsx"
Cohesion: 0.10
Nodes (22): AlertError(), ManageTwoFactor(), Props, TwoFactorRecoveryCodes(), Props, TwoFactorSetupModal(), TwoFactorSetupStep(), Alert() (+14 more)

### Community 149 - "laravel-best-practices/SKILL.md"
Cohesion: 0.17
Nodes (10): Configuration Best Practices, `env()` Only in Config Files, Use `App::environment()` for Environment Checks, Use Constants and Language Files, Use Encrypted Env or External Secrets, Consistency First, Decision Rules, How to Apply (+2 more)

### Community 150 - "app-header.tsx"
Cohesion: 0.12
Nodes (19): mainNavItems, Props, rightNavItems, NavigationMenu(), NavigationMenuContent(), NavigationMenuIndicator(), NavigationMenuItem(), NavigationMenuLink() (+11 more)

### Community 151 - "thank-you.tsx"
Cohesion: 0.50
Nodes (4): formatPrice(), Order, Props, ThankYou()

### Community 152 - "ProductCategory"
Cohesion: 0.13
Nodes (5): ProductCategoryController, StoreProductCategoryRequest, UpdateProductCategoryRequest, ProductCategory, ProductFactory

### Community 153 - "package.json"
Cohesion: 0.50
Nodes (3): private, $schema, type

### Community 155 - "Product.php"
Cohesion: 0.17
Nodes (6): AdminUserSeeder, DatabaseSeeder, ProductCatalogSeeder, StorefrontBannerSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 160 - "RTK - Rust Token Killer"
Cohesion: 0.33
Nodes (5): Avoid RTK For, Good RTK Uses, How RTK Fits With Graphify, RTK - Rust Token Killer, Useful Checks

## Knowledge Gaps
- **538 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+533 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **53 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `admin-sidebar.tsx`, `inventory/index.tsx`, `products/index.tsx`, `button.tsx`, `utils.ts`, `admin/dashboard.tsx`, `dropdown-menu.tsx`, `toggle-group.tsx`, `user-info.tsx`, `categories/index.tsx`, `index.ts`, `app-header.tsx`, `banners/index.tsx`, `breadcrumbs.tsx`, `two-factor-setup-modal.tsx`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Why does `Controller` connect `Controller` to `Illuminate\Http\JsonResponse`, `Order`, `Product`, `ProductCategory`, `ProductVariant.php`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `ProductCategory` connect `ProductCategory` to `Order`, `Product`, `Product.php`, `ProductVariant`, `Controller`, `ProductVariant.php`, `Illuminate\Database\Eloquent\Factories\Factory`?**
  _High betweenness centrality (0.006) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _538 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Illuminate\Http\JsonResponse` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05128205128205128 - nodes in this community are weakly interconnected._