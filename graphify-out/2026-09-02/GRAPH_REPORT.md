# Graph Report - doren  (2026-09-02)

## Corpus Check
- 292 files · ~214,811 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1593 nodes · 2935 edges · 171 communities (119 shown, 52 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 31 edges (avg confidence: 0.75)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `215b2652`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mail Best Practices
- StorefrontBanner
- utils.ts
- scripts
- AGENTS.md
- Inertia React Development
- @laravel/passkeys
- button.tsx
- admin/dashboard.tsx
- dropdown-menu.tsx
- StoreProductRequest
- two-factor-setup-modal.tsx
- Pest 5 Features
- compilerOptions
- StorefrontBanner.php
- User.php
- components.json
- Laravel Fortify Development
- inventory/index.tsx
- Product
- devDependencies
- Tailwind CSS Development
- sales/index.tsx
- app.tsx
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
- FortifyServiceProvider.php
- CheckoutController
- Advanced Query Patterns
- Database Performance Best Practices
- Events & Notifications Best Practices
- Wayfinder Development
- Caching Best Practices
- Eloquent Best Practices
- Migration Best Practices
- laravel-best-practices/SKILL.md
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
- ProductCategory
- Routing & Controllers Best Practices
- Conventions & Style
- Validation & Forms Best Practices
- config
- Illuminate\Http\Request
- @radix-ui/react-checkbox
- welcome.tsx
- Pages
- InventoryMovement
- @radix-ui/react-navigation-menu
- TestCase
- psr-4
- laravel
- eslint-plugin-import
- placeholder-pattern.tsx
- show.tsx
- input-otp
- autoload-dev
- keywords
- eslint.config.js
- icon.tsx
- Illuminate\Database\Eloquent\Factories\Factory
- Admin Products
- Illuminate\Http\JsonResponse
- @radix-ui/react-select
- products/index.tsx
- DashboardController
- Requests Admin
- sidebar.tsx
- checkout.tsx
- @radix-ui/react-avatar
- Order
- @inertiajs/react
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- lucide-react
- orders/index.tsx
- @radix-ui/react-separator
- @radix-ui/react-slot
- @radix-ui/react-toggle-group
- @radix-ui/react-tooltip
- index.ts
- react-dom
- sonner
- tailwind-merge
- Pages Products
- cn
- ProfileController.php
- auth.ts
- typescript
- vite
- @vitejs/plugin-react
- @radix-ui/react-collapsible
- Configuration Best Practices
- app-header.tsx
- thank-you.tsx
- Illuminate\Foundation\Http\FormRequest
- package.json
- Inventory
- concurrently
- eslint-plugin-react-hooks
- @eslint/js
- Products
- RTK - Rust Token Killer
- eslint-plugin-react
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
6. `Order` - 20 edges
7. `ProductVariant` - 20 edges
8. `useAdminApi()` - 19 edges
9. `User` - 18 edges
10. `Input()` - 17 edges

## Surprising Connections (you probably didn't know these)
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuSubTrigger()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuSubContent()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Communities (171 total, 52 thin omitted)

### Community 0 - "Mail Best Practices"
Cohesion: 0.29
Nodes (6): Implement `ShouldQueue` on the Mailable Class, Mail Best Practices, Separate Content Tests from Sending Tests, Use `afterCommit()` on Mailables Inside Transactions, Use `assertQueued()` Not `assertSent()` for Queued Mailables, Use Markdown Mailables for Transactional Emails

### Community 1 - "StorefrontBanner"
Cohesion: 0.19
Nodes (4): StorefrontBannerController, HomeController, StoreStorefrontBannerRequest, StorefrontBanner

### Community 2 - "utils.ts"
Cohesion: 0.11
Nodes (28): AdminNavSection, adminNavSections, AdminSidebar(), AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain() (+20 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (40): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+32 more)

### Community 4 - "AGENTS.md"
Cohesion: 0.05
Nodes (39): APIs & Eloquent Resources, Application Structure & Architecture, Artisan, Avoid RTK For, Command Usage, Conventions, Deployment, Do Things the Laravel Way (+31 more)

### Community 5 - "Inertia React Development"
Cohesion: 0.07
Nodes (27): Basic Link Component, Basic Usage, Client-Side Navigation, Common Pitfalls, Deferred Props, Documentation, Form Component (Recommended), Form Component Reset Props (+19 more)

### Community 7 - "button.tsx"
Cohesion: 0.10
Nodes (27): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem() (+19 more)

### Community 8 - "admin/dashboard.tsx"
Cohesion: 0.12
Nodes (24): ApiEnvelope, useAdminApi(), formatDate(), formatMoney(), titleCase(), AdminBannersIndex(), AdminCategoriesIndex(), AdminCustomersIndex() (+16 more)

### Community 9 - "dropdown-menu.tsx"
Cohesion: 0.13
Nodes (16): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+8 more)

### Community 10 - "StoreProductRequest"
Cohesion: 0.11
Nodes (3): ProductController, StoreProductRequest, UpdateProductRequest

### Community 11 - "two-factor-setup-modal.tsx"
Cohesion: 0.07
Nodes (36): AlertError(), AppearanceToggleTab(), Props, TwoFactorSetupStep(), Alert(), AlertDescription(), AlertTitle(), alertVariants (+28 more)

### Community 12 - "Pest 5 Features"
Cohesion: 0.10
Nodes (19): Architecture Testing, Assertions, Basic Test Structure, Basic Usage, Browser Test Example, Common Pitfalls, Creating Tests, Datasets (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 14 - "StorefrontBanner.php"
Cohesion: 0.22
Nodes (6): AdminUserSeeder, DatabaseSeeder, ProductCatalogSeeder, StorefrontBannerSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 15 - "User.php"
Cohesion: 0.10
Nodes (8): User, InventoryMovementFactory, static, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable, Laravel\Fortify\TwoFactorAuthenticatable

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "Laravel Fortify Development"
Cohesion: 0.12
Nodes (16): Available Features, Best Practices, Custom Authentication Logic, Documentation, Email Verification Setup, Key Endpoints, Laravel Fortify Development, Passkeys Setup (+8 more)

### Community 18 - "inventory/index.tsx"
Cohesion: 0.15
Nodes (15): Textarea(), AdminInventoryIndex(), emptyMovement, formatDateTime(), InventoryData, inventoryListingUrl(), InventoryMetrics, InventoryMovement (+7 more)

### Community 19 - "Product"
Cohesion: 0.16
Nodes (5): ProductShowController, Product, ProductVariant, OrderItemFactory, Illuminate\Database\Eloquent\Relations\HasMany

### Community 21 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-prettier (+7 more)

### Community 22 - "Tailwind CSS Development"
Cohesion: 0.14
Nodes (13): Basic Usage, Common Patterns, Common Pitfalls, CSS-First Configuration, Dark Mode, Documentation, Flexbox Layout, Grid Layout (+5 more)

### Community 23 - "sales/index.tsx"
Cohesion: 0.21
Nodes (14): Props, Badge(), badgeVariants, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+6 more)

### Community 24 - "app.tsx"
Cohesion: 0.14
Nodes (11): AppLogo(), AppLogoIcon(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), AdminLayout(), AppLayout() (+3 more)

### Community 25 - "Controller"
Cohesion: 0.11
Nodes (12): CustomerController, DashboardController, InventoryController, OrderController, ProductCategoryController, ProductController, SalesController, StorefrontBannerController (+4 more)

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

### Community 38 - "FortifyServiceProvider.php"
Cohesion: 0.20
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

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

### Community 48 - "laravel-best-practices/SKILL.md"
Cohesion: 0.33
Nodes (5): Consistency First, Decision Rules, How to Apply, Laravel Best Practices, Rule Index

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

### Community 59 - "ProductCategory"
Cohesion: 0.12
Nodes (7): OrderItem, ProductCategory, ProductVariantImage, ProductFactory, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

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

### Community 64 - "Illuminate\Http\Request"
Cohesion: 0.06
Nodes (22): CreateNewUser, ResetUserPassword, emailRules(), nameRules(), profileRules(), EnsureUserIsAdmin, HandleAppearance, HandleInertiaRequests (+14 more)

### Community 66 - "welcome.tsx"
Cohesion: 0.11
Nodes (22): bannerTitleLines(), benefits, BottomCampaign(), categoryHref(), fallbackImages, footerColumns, formatPrice(), HeroCarousel() (+14 more)

### Community 68 - "InventoryMovement"
Cohesion: 0.18
Nodes (5): RecordInventoryMovement, InventoryController, StoreInventoryMovementRequest, InventoryMovement, InventoryMovementType

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
Cohesion: 0.13
Nodes (8): OrderFactory, ProductCategoryFactory, ProductVariantFactory, ProductVariantImageFactory, StorefrontBannerFactory, static, UserFactory, Illuminate\Database\Eloquent\Factories\Factory

### Community 97 - "Illuminate\Http\JsonResponse"
Cohesion: 0.16
Nodes (5): CustomerController, ProductCategoryController, StoreSettingController, StoreProductCategoryRequest, Illuminate\Http\JsonResponse

### Community 100 - "products/index.tsx"
Cohesion: 0.15
Nodes (18): Checkbox(), AdminProductsIndex(), CategoryOption, centsToPrice(), colorsFromVariants(), makeEmptyColor(), makeEmptyProduct(), Product (+10 more)

### Community 103 - "sidebar.tsx"
Cohesion: 0.11
Nodes (22): NavUser(), Sidebar(), SidebarContext, SidebarGroupAction(), SidebarInput(), SidebarInset(), SidebarMenuAction(), SidebarMenuBadge() (+14 more)

### Community 104 - "checkout.tsx"
Cohesion: 0.38
Nodes (6): CartItem, Checkout(), CheckoutForm, fieldLabel(), formatPrice(), Props

### Community 106 - "Order"
Cohesion: 0.16
Nodes (6): OrderController, UpdateOrderRequest, Order, colorImageUrls(), productPayload(), variantsPayload()

### Community 112 - "orders/index.tsx"
Cohesion: 0.10
Nodes (33): AdminApiState(), Props, AdminPagination(), AdminPaginationMeta, AdminPaginationProps, pageNumbers(), pageUrl(), Props (+25 more)

### Community 117 - "index.ts"
Cohesion: 0.24
Nodes (9): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), AppSidebarLayout(), BreadcrumbItem, AppLayoutProps (+1 more)

### Community 122 - "cn"
Cohesion: 0.10
Nodes (30): AppHeader(), Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage() (+22 more)

### Community 124 - "ProfileController.php"
Cohesion: 0.15
Nodes (7): CartItemController, ProfileController, SecurityController, TwoFactorAuthenticationRequest, Illuminate\Contracts\Auth\MustVerifyEmail, Illuminate\Http\RedirectResponse, Laravel\Fortify\InteractsWithTwoFactorState

### Community 125 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 149 - "Configuration Best Practices"
Cohesion: 0.33
Nodes (5): Configuration Best Practices, `env()` Only in Config Files, Use `App::environment()` for Environment Checks, Use Constants and Language Files, Use Encrypted Env or External Secrets

### Community 150 - "app-header.tsx"
Cohesion: 0.13
Nodes (18): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+10 more)

### Community 151 - "thank-you.tsx"
Cohesion: 0.50
Nodes (4): formatPrice(), Order, Props, ThankYou()

### Community 152 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.12
Nodes (5): UpdateProductCategoryRequest, UpdateStorefrontBannerRequest, StoreCartItemRequest, StoreCheckoutRequest, Illuminate\Foundation\Http\FormRequest

### Community 153 - "package.json"
Cohesion: 0.50
Nodes (3): private, $schema, type

### Community 160 - "RTK - Rust Token Killer"
Cohesion: 0.29
Nodes (6): Avoid RTK For, Good RTK Uses, How RTK Fits With Graphify, RTK - Rust Token Killer, RTK With Laravel Commands, Useful Checks

## Knowledge Gaps
- **547 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+542 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **52 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `cn` to `utils.ts`, `products/index.tsx`, `button.tsx`, `sidebar.tsx`, `dropdown-menu.tsx`, `two-factor-setup-modal.tsx`, `orders/index.tsx`, `inventory/index.tsx`, `app-header.tsx`, `sales/index.tsx`, `app.tsx`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Why does `Controller` connect `Controller` to `Illuminate\Http\JsonResponse`, `StorefrontBanner`, `InventoryMovement`, `DashboardController`, `CheckoutController`, `Order`, `StoreProductRequest`, `Product`, `ProductCategory`, `ProfileController.php`?**
  _High betweenness centrality (0.012) - this node is a cross-community bridge._
- **Why does `ProductCategory` connect `ProductCategory` to `Illuminate\Http\JsonResponse`, `StorefrontBanner`, `DashboardController`, `StoreProductRequest`, `Order`, `StorefrontBanner.php`, `Product`, `Illuminate\Foundation\Http\FormRequest`, `Controller`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _547 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `utils.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.11428571428571428 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._