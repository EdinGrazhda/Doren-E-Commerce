# Graph Report - doren  (2026-10-14)

## Corpus Check
- 337 files · ~245,277 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1819 nodes · 3472 edges · 209 communities (139 shown, 70 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 46 edges (avg confidence: 0.77)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `52db7624`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Mail Best Practices
- StorefrontBanner
- app-logo-icon.tsx
- scripts
- AGENTS.md
- Inertia React Development
- @laravel/passkeys
- migrations.sql
- ProfileValidationRules.php
- dropdown-menu.tsx
- Product
- use-appearance.tsx
- Pest 5 Features
- compilerOptions
- Illuminate\Database\Console\Seeds\WithoutModelEvents
- components.json
- Laravel Fortify Development
- utils.ts
- globals
- devDependencies
- Tailwind CSS Development
- Illuminate\Foundation\Http\FormRequest
- app-header.tsx
- Controller
- Admin
- optionalDependencies
- Detection Checklist
- Process
- Architecture Best Practices
- Security Best Practices
- index.md
- require-dev
- banners/index.tsx
- Queue & Job Best Practices
- inventory/index.tsx
- ProductCampaignPrice
- admin/dashboard.tsx
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
- Order.php
- Routing & Controllers Best Practices
- Conventions & Style
- Validation & Forms Best Practices
- config
- access-control/index.tsx
- sidebar.tsx
- welcome.tsx
- Pages
- ProductVariant.php
- use-current-url.ts
- TestCase
- psr-4
- laravel
- UserFactory
- placeholder-pattern.tsx
- User.php
- OrderConfirmation.php
- autoload-dev
- keywords
- eslint.config.js
- icon.tsx
- two-factor-setup-modal.tsx
- index.ts
- Admin Products
- package.json
- @radix-ui/react-select
- products/index.tsx
- DashboardController
- Requests Admin
- @eslint/js
- InventoryMovement
- UpdateProductRequest
- CheckoutController.php
- Pages Admin Products
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- lucide-react
- Campaign
- delete-user.tsx
- @radix-ui/react-separator
- @radix-ui/react-slot
- SafeActionUrl
- @radix-ui/react-tooltip
- ProductVariant
- react-dom
- sonner
- tailwind-merge
- Pages Products
- eslint-plugin-import
- @inertiajs/react
- Illuminate\Http\RedirectResponse
- security.tsx
- typescript
- vite
- Illuminate\Http\JsonResponse
- ProductCatalogSeeder
- UpdateProductCategoryRequest
- eslint-plugin-react
- concurrently
- sheet.tsx
- thank-you.tsx
- Illuminate\Http\Request
- @radix-ui/react-avatar
- Inventory
- @radix-ui/react-navigation-menu
- Product.php
- @radix-ui/react-toggle-group
- Products
- RTK - Rust Token Killer
- orders/index.tsx
- RoleController.php
- react
- cn
- @radix-ui/react-toggle
- @radix-ui/react-label
- tailwindcss
- @types/react
- @types/react-dom
- @tailwindcss/vite
- @vitejs/plugin-react
- prettier-plugin-tailwindcss
- @stylistic/eslint-plugin
- @types/node
- Order
- input-otp
- Images
- PermissionController.php
- Illuminate\Database\Eloquent\Factories\Factory
- FortifyServiceProvider.php
- StoreProductRequest
- Mail
- SafeImageUrl
- @radix-ui/react-checkbox
- auth.ts
- Campaigns
- PasswordValidationRules.php
- Js Pages Products
- StoreProductCategoryRequest
- SitemapController.php
- StoreCartItemRequest
- TwoFactorAuthenticationRequest
- FortifyServiceProvider
- RuntimeException
- StorefrontBannerSeeder
- @radix-ui/react-collapsible
- clsx
- eslint-plugin-react-hooks

## God Nodes (most connected - your core abstractions)
1. `cn()` - 131 edges
2. `Controller` - 51 edges
3. `Product` - 35 edges
4. `Button()` - 31 edges
5. `Order` - 26 edges
6. `ProductVariant` - 23 edges
7. `useAdminApi()` - 23 edges
8. `ProductCategory` - 21 edges
9. `User` - 20 edges
10. `Input()` - 18 edges

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

## Communities (209 total, 70 thin omitted)

### Community 0 - "Mail Best Practices"
Cohesion: 0.29
Nodes (6): Implement `ShouldQueue` on the Mailable Class, Mail Best Practices, Separate Content Tests from Sending Tests, Use `afterCommit()` on Mailables Inside Transactions, Use `assertQueued()` Not `assertSent()` for Queued Mailables, Use Markdown Mailables for Transactional Emails

### Community 1 - "StorefrontBanner"
Cohesion: 0.19
Nodes (4): StorefrontBannerController, StoreStorefrontBannerRequest, UpdateStorefrontBannerRequest, StorefrontBanner

### Community 2 - "app-logo-icon.tsx"
Cohesion: 0.31
Nodes (4): AppLogoIcon(), AuthSimpleLayout(), AuthLayout(), AuthLayoutProps

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (40): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+32 more)

### Community 4 - "AGENTS.md"
Cohesion: 0.06
Nodes (33): APIs & Eloquent Resources, Application Structure & Architecture, Artisan, Conventions, Deployment, Do Things the Laravel Way, Documentation Files, Foundational Context (+25 more)

### Community 5 - "Inertia React Development"
Cohesion: 0.07
Nodes (27): Basic Link Component, Basic Usage, Client-Side Navigation, Common Pitfalls, Deferred Props, Documentation, Form Component (Recommended), Form Component Reset Props (+19 more)

### Community 7 - "migrations.sql"
Cohesion: 0.12
Nodes (25): cache, cache_locks, campaign_product, campaigns, failed_jobs, inventory_movements, job_batches, jobs (+17 more)

### Community 8 - "ProfileValidationRules.php"
Cohesion: 0.29
Nodes (6): CreateNewUser, emailRules(), nameRules(), profileRules(), ProfileUpdateRequest, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 9 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (21): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+13 more)

### Community 10 - "Product"
Cohesion: 0.17
Nodes (5): StoreOptimizedImage, DeleteProduct, ProductController, Product, Illuminate\Database\Eloquent\Relations\BelongsToMany

### Community 11 - "use-appearance.tsx"
Cohesion: 0.13
Nodes (21): AppearanceToggleTab(), Toaster(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme(), isDarkMode() (+13 more)

### Community 12 - "Pest 5 Features"
Cohesion: 0.10
Nodes (19): Architecture Testing, Assertions, Basic Test Structure, Basic Usage, Browser Test Example, Common Pitfalls, Creating Tests, Datasets (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 15 - "Illuminate\Database\Console\Seeds\WithoutModelEvents"
Cohesion: 0.25
Nodes (8): AdminUserSeeder, DatabaseSeeder, EmployeeUserSeeder, RolePermissionSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "Laravel Fortify Development"
Cohesion: 0.12
Nodes (16): Available Features, Best Practices, Custom Authentication Logic, Documentation, Email Verification Setup, Key Endpoints, Laravel Fortify Development, Passkeys Setup (+8 more)

### Community 18 - "utils.ts"
Cohesion: 0.17
Nodes (10): PasskeyVerify(), Props, Props, TextLink(), Button(), buttonVariants, Separator(), Spinner() (+2 more)

### Community 21 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-prettier (+7 more)

### Community 22 - "Tailwind CSS Development"
Cohesion: 0.14
Nodes (13): Basic Usage, Common Patterns, Common Pitfalls, CSS-First Configuration, Dark Mode, Documentation, Flexbox Layout, Grid Layout (+5 more)

### Community 23 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.20
Nodes (4): StoreInventoryMovementRequest, StorePermissionRequest, Illuminate\Contracts\Validation\ValidationRule, Illuminate\Foundation\Http\FormRequest

### Community 24 - "app-header.tsx"
Cohesion: 0.19
Nodes (14): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Tooltip(), TooltipContent() (+6 more)

### Community 25 - "Controller"
Cohesion: 0.13
Nodes (11): AccessControlController, CampaignController, CustomerController, InventoryController, OrderController, ProductCategoryController, ProductController, SalesController (+3 more)

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

### Community 35 - "banners/index.tsx"
Cohesion: 0.10
Nodes (27): Checkbox(), Select(), SelectContent(), SelectItem(), SelectTrigger(), SelectValue(), Textarea(), AdminBannersIndex() (+19 more)

### Community 36 - "Queue & Job Best Practices"
Cohesion: 0.18
Nodes (10): Always Implement `failed()`, Batch Related Jobs, Implement `ShouldBeUnique`, Queue & Job Best Practices, Rate Limit External API Calls in Jobs, `retryUntil()` Needs `$tries = 0`, Set `retry_after` Greater Than `timeout`, Use Exponential Backoff (+2 more)

### Community 37 - "inventory/index.tsx"
Cohesion: 0.13
Nodes (19): AdminPagination(), AdminPaginationMeta, AdminPaginationProps, pageNumbers(), pageUrl(), AdminInventoryIndex(), emptyMovement, formatDateTime() (+11 more)

### Community 38 - "ProductCampaignPrice"
Cohesion: 0.16
Nodes (4): CreateCheckoutOrder, HomeController, ProductShowController, ProductCampaignPrice

### Community 39 - "admin/dashboard.tsx"
Cohesion: 0.10
Nodes (28): Badge(), badgeVariants, formatDate(), formatMoney(), titleCase(), AdminCategoriesIndex(), AdminCustomersIndex(), AdminDashboard() (+20 more)

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
Cohesion: 0.17
Nodes (10): Configuration Best Practices, `env()` Only in Config Files, Use `App::environment()` for Environment Checks, Use Constants and Language Files, Use Encrypted Env or External Secrets, Consistency First, Decision Rules, How to Apply (+2 more)

### Community 49 - "dependencies"
Cohesion: 0.22
Nodes (9): class-variance-authority, @inertiajs/vite, laravel-vite-plugin, dependencies, class-variance-authority, @inertiajs/vite, laravel-vite-plugin, tw-animate-css (+1 more)

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
Cohesion: 0.20
Nodes (10): require, inertiajs/inertia-laravel, laravel/chisel, laravel/fortify, laravel/framework, laravel/sanctum, laravel/tinker, laravel/wayfinder (+2 more)

### Community 57 - "Collection Best Practices"
Cohesion: 0.29
Nodes (6): Choose `cursor()` vs. `lazy()` Correctly, Collection Best Practices, Use `#[CollectedBy]` for Custom Collection Classes, Use Higher-Order Messages for Simple Operations, Use `lazyById()` When Updating Records While Iterating, Use `toQuery()` for Bulk Operations on Collections

### Community 58 - "HTTP Client Best Practices"
Cohesion: 0.29
Nodes (6): Always Set Explicit Timeouts, Fake HTTP Calls in Tests, Handle Errors Explicitly, HTTP Client Best Practices, Use Request Pooling for Concurrent Requests, Use Retry with Backoff for External APIs

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

### Community 64 - "access-control/index.tsx"
Cohesion: 0.15
Nodes (21): AdminApiState(), Props, Props, Card(), CardContent(), CardDescription(), CardHeader(), CardTitle() (+13 more)

### Community 65 - "sidebar.tsx"
Cohesion: 0.10
Nodes (35): AdminNavSection, adminNavSections, AppLogo(), AppSidebar(), footerNavItems, mainNavItems, NavFooter(), NavMain() (+27 more)

### Community 66 - "welcome.tsx"
Cohesion: 0.05
Nodes (47): BrandLogo(), BrandLogoProps, logoSources, StorefrontNavigation(), Cart(), CartItem, formatPrice(), Props (+39 more)

### Community 68 - "ProductVariant.php"
Cohesion: 0.16
Nodes (6): OrderItem, ProductVariantImage, Illuminate\Database\Eloquent\Collection, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model, Illuminate\Database\Eloquent\Relations\BelongsTo

### Community 69 - "use-current-url.ts"
Cohesion: 0.27
Nodes (9): AdminSidebar(), AppHeader(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn, WhenCurrentUrlFn, SettingsLayout() (+1 more)

### Community 71 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 72 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 75 - "User.php"
Cohesion: 0.12
Nodes (8): User, Illuminate\Contracts\Auth\MustVerifyEmail, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable, Laravel\Fortify\TwoFactorAuthenticatable, Spatie\Permission\Traits\HasRoles

### Community 76 - "OrderConfirmation.php"
Cohesion: 0.26
Nodes (7): OrderConfirmation, Illuminate\Bus\Queueable, Illuminate\Contracts\Queue\ShouldQueue, Illuminate\Mail\Mailable, Illuminate\Mail\Mailables\Content, Illuminate\Mail\Mailables\Envelope, Illuminate\Queue\SerializesModels

### Community 78 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 79 - "keywords"
Cohesion: 0.67
Nodes (3): keywords, framework, laravel

### Community 94 - "two-factor-setup-modal.tsx"
Cohesion: 0.12
Nodes (17): AlertError(), Props, TwoFactorSetupModal(), TwoFactorSetupStep(), Alert(), AlertDescription(), AlertTitle(), alertVariants (+9 more)

### Community 95 - "index.ts"
Cohesion: 0.24
Nodes (9): AppContent(), Props, AppShell(), Props, AppSidebarHeader(), AppSidebarLayout(), BreadcrumbItem, AppLayoutProps (+1 more)

### Community 97 - "package.json"
Cohesion: 0.50
Nodes (3): private, $schema, type

### Community 100 - "products/index.tsx"
Cohesion: 0.13
Nodes (22): productSaveHttpError(), productSaveRequestError(), SaveResponse, serverFailures, AdminProductsIndex(), CategoryOption, centsToPrice(), colorsFromVariants() (+14 more)

### Community 101 - "DashboardController"
Cohesion: 0.38
Nodes (3): DashboardController, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder

### Community 104 - "InventoryMovement"
Cohesion: 0.16
Nodes (6): RecordInventoryMovement, InventoryController, InventoryMovement, InventoryMovementFactory, static, InventoryMovementType

### Community 106 - "CheckoutController.php"
Cohesion: 0.14
Nodes (5): CartController, CheckoutController, StoreCheckoutRequest, PriceCartItems, Illuminate\Support\Collection

### Community 111 - "Campaign"
Cohesion: 0.16
Nodes (5): SaveCampaign, CampaignController, StoreCampaignRequest, UpdateCampaignRequest, Campaign

### Community 112 - "delete-user.tsx"
Cohesion: 0.24
Nodes (7): DeleteUser(), InputError(), Props, PasswordInput(), Label(), Props, PageProps

### Community 117 - "ProductVariant"
Cohesion: 0.16
Nodes (3): ProductVariant, ProductVariantImageFactory, Illuminate\Database\Eloquent\Relations\HasMany

### Community 124 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.16
Nodes (5): DashboardController, CartItemController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse

### Community 125 - "security.tsx"
Cohesion: 0.18
Nodes (11): Heading(), ManagePasskeys(), Props, ManageTwoFactor(), Props, PasskeyItem(), PasskeyRegistration(), TwoFactorRecoveryCodes() (+3 more)

### Community 128 - "Illuminate\Http\JsonResponse"
Cohesion: 0.23
Nodes (4): CustomerController, ProductCategoryController, ProductCategory, Illuminate\Http\JsonResponse

### Community 150 - "sheet.tsx"
Cohesion: 0.22
Nodes (10): Props, Sheet(), SheetClose(), SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay() (+2 more)

### Community 151 - "thank-you.tsx"
Cohesion: 0.50
Nodes (4): formatPrice(), Order, Props, ThankYou()

### Community 152 - "Illuminate\Http\Request"
Cohesion: 0.21
Nodes (9): EnsureUserIsAdmin, HandleAppearance, HandleInertiaRequests, SecurityHeaders, Closure, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Request, Inertia\Middleware (+1 more)

### Community 156 - "Product.php"
Cohesion: 0.20
Nodes (6): GdImage, Illuminate\Http\UploadedFile, colorImageUrls(), numericVariantsPayload(), productPayload(), variantsPayload()

### Community 160 - "RTK - Rust Token Killer"
Cohesion: 0.29
Nodes (6): Avoid RTK For, Good RTK Uses, How RTK Fits With Graphify, RTK - Rust Token Killer, RTK With Laravel Commands, Useful Checks

### Community 161 - "orders/index.tsx"
Cohesion: 0.17
Nodes (18): Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+10 more)

### Community 163 - "RoleController.php"
Cohesion: 0.19
Nodes (4): RoleController, StoreRoleRequest, UpdateRoleRequest, Role

### Community 165 - "cn"
Cohesion: 0.10
Nodes (30): Breadcrumbs(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+22 more)

### Community 176 - "Order"
Cohesion: 0.27
Nodes (3): OrderController, UpdateOrderRequest, Order

### Community 180 - "PermissionController.php"
Cohesion: 0.22
Nodes (3): PermissionController, UpdatePermissionRequest, Permission

### Community 181 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.15
Nodes (7): CampaignFactory, OrderItemFactory, ProductCategoryFactory, ProductFactory, ProductVariantFactory, StorefrontBannerFactory, Illuminate\Database\Eloquent\Factories\Factory

### Community 182 - "FortifyServiceProvider.php"
Cohesion: 0.21
Nodes (4): ResetUserPassword, AppServiceProvider, Illuminate\Support\ServiceProvider, Laravel\Fortify\Contracts\ResetsUserPasswords

### Community 192 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 200 - "SitemapController.php"
Cohesion: 0.53
Nodes (3): SitemapController, Generator, Symfony\Component\HttpFoundation\StreamedResponse

## Knowledge Gaps
- **576 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+571 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **70 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Permission` connect `PermissionController.php` to `access-control/index.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Role` connect `RoleController.php` to `access-control/index.tsx`?**
  _High betweenness centrality (0.077) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `access-control/index.tsx`, `orders/index.tsx`, `welcome.tsx`, `banners/index.tsx`, `sidebar.tsx`, `use-current-url.ts`, `admin/dashboard.tsx`, `dropdown-menu.tsx`, `use-appearance.tsx`, `delete-user.tsx`, `utils.ts`, `sheet.tsx`, `app-header.tsx`, `two-factor-setup-modal.tsx`?**
  _High betweenness centrality (0.065) - this node is a cross-community bridge._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _576 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._
- **Should `AGENTS.md` be split into smaller, more focused modules?**
  _Cohesion score 0.058823529411764705 - nodes in this community are weakly interconnected._
- **Should `Inertia React Development` be split into smaller, more focused modules?**
  _Cohesion score 0.07142857142857142 - nodes in this community are weakly interconnected._