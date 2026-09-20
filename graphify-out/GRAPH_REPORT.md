# Graph Report - doren  (2026-09-20)

## Corpus Check
- 345 files · ~233,597 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1854 nodes · 3509 edges · 207 communities (139 shown, 68 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.76)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b981590e`
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
- VirtualTryOn
- ProductVariant.php
- dropdown-menu.tsx
- Product
- use-appearance.tsx
- Pest 5 Features
- compilerOptions
- User.php
- components.json
- Laravel Fortify Development
- button.tsx
- ProductVariant
- devDependencies
- Tailwind CSS Development
- banners/index.tsx
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
- campaigns/index.tsx
- Queue & Job Best Practices
- inventory/index.tsx
- admin/dashboard.tsx
- AdminPanelTest.php
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
- Order
- Routing & Controllers Best Practices
- Conventions & Style
- Validation & Forms Best Practices
- config
- StoreCartItemRequest
- FortifyServiceProvider.php
- welcome.tsx
- Pages
- InventoryMovement
- @radix-ui/react-navigation-menu
- TestCase
- psr-4
- laravel
- Illuminate\Database\Console\Seeds\WithoutModelEvents
- placeholder-pattern.tsx
- ServerTest
- input-otp
- autoload-dev
- keywords
- eslint.config.js
- icon.tsx
- ProductCampaignPrice
- two-factor-setup-modal.tsx
- Admin Products
- Illuminate\Http\JsonResponse
- @radix-ui/react-select
- products/index.tsx
- Api/Admin/DashboardController.php
- Requests Admin
- sidebar.tsx
- categories/index.tsx
- @radix-ui/react-avatar
- eslint-plugin-import
- @inertiajs/react
- @radix-ui/react-dialog
- @radix-ui/react-dropdown-menu
- lucide-react
- Campaign
- Illuminate\Foundation\Http\FormRequest
- @radix-ui/react-separator
- @radix-ui/react-slot
- show.tsx
- @radix-ui/react-tooltip
- app-sidebar.tsx
- react-dom
- sonner
- tailwind-merge
- Pages Products
- cn
- Spatie\Permission\Models\Role
- Illuminate\Http\RedirectResponse
- tw-animate-css
- typescript
- vite
- @vitejs/plugin-react
- @radix-ui/react-collapsible
- ProfileValidationRules.php
- Illuminate\Contracts\Validation\ValidationRule
- StoreProductRequest
- UpdateProductRequest
- thank-you.tsx
- Illuminate\Http\Request
- package.json
- Inventory
- @radix-ui/react-toggle
- auth.ts
- @eslint/js
- Products
- brand-logo.tsx
- alert-error.tsx
- CheckoutController.php
- eslint-plugin-react
- checkout.tsx
- globals
- @radix-ui/react-label
- ResetUserPassword.php
- react
- tailwindcss
- @tailwindcss/vite
- @types/react
- @types/react-dom
- prettier-plugin-tailwindcss
- @stylistic/eslint-plugin
- @types/node
- SafeImageUrl
- Images
- @radix-ui/react-toggle-group
- Illuminate\Database\Eloquent\Factories\Factory
- ProductCatalogSeeder
- UserFactory
- Mail
- eslint-plugin-react-hooks
- @radix-ui/react-checkbox
- SafeActionUrl
- app.tsx
- Js Pages Products
- Campaigns
- StoreInventoryMovementRequest
- UpdateRoleRequest
- TwoFactorAuthenticationRequest
- bannerTitleLines
- Components
- General
- Try On
- download_weights.py
- clsx

## God Nodes (most connected - your core abstractions)
1. `cn()` - 131 edges
2. `Controller` - 51 edges
3. `Product` - 37 edges
4. `Button()` - 31 edges
5. `ProductCategory` - 28 edges
6. `ProductVariant` - 26 edges
7. `Order` - 23 edges
8. `useAdminApi()` - 21 edges
9. `User` - 20 edges
10. `VirtualTryOn` - 19 edges

## Surprising Connections (you probably didn't know these)
- `tryOnVariant()` --calls--> `Product`  [INFERRED]
  tests/Feature/VirtualTryOnTest.php → app/Models/Product.php
- `tryOnVariant()` --calls--> `ProductCategory`  [EXTRACTED]
  tests/Feature/VirtualTryOnTest.php → app/Models/ProductCategory.php
- `tryOnVariant()` --references--> `ProductVariant`  [EXTRACTED]
  tests/Feature/VirtualTryOnTest.php → app/Models/ProductVariant.php
- `DropdownMenuCheckboxItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts
- `DropdownMenuRadioItem()` --calls--> `cn()`  [EXTRACTED]
  resources/js/components/ui/dropdown-menu.tsx → resources/js/lib/utils.ts

## Import Cycles
- None detected.

## Communities (207 total, 68 thin omitted)

### Community 0 - "Mail Best Practices"
Cohesion: 0.29
Nodes (6): Implement `ShouldQueue` on the Mailable Class, Mail Best Practices, Separate Content Tests from Sending Tests, Use `afterCommit()` on Mailables Inside Transactions, Use `assertQueued()` Not `assertSent()` for Queued Mailables, Use Markdown Mailables for Transactional Emails

### Community 1 - "StorefrontBanner"
Cohesion: 0.11
Nodes (10): StoreOptimizedImage, StorefrontBannerController, StoreStorefrontBannerRequest, UpdateStorefrontBannerRequest, StorefrontBanner, GdImage, Illuminate\Http\UploadedFile, colorUploadSet() (+2 more)

### Community 2 - "utils.ts"
Cohesion: 0.20
Nodes (12): AdminSidebar(), NavFooter(), NavMain(), Separator(), IsCurrentOrParentUrlFn, IsCurrentUrlFn, useCurrentUrl(), UseCurrentUrlReturn (+4 more)

### Community 3 - "scripts"
Cohesion: 0.05
Nodes (40): scripts, ci:check, dev, lint, lint:check, post-autoload-dump, post-create-project-cmd, post-root-package-install (+32 more)

### Community 4 - "AGENTS.md"
Cohesion: 0.05
Nodes (35): APIs & Eloquent Resources, Application Structure & Architecture, Artisan, Conventions, Deployment, Do Things the Laravel Way, Documentation Files, Foundational Context (+27 more)

### Community 5 - "Inertia React Development"
Cohesion: 0.07
Nodes (27): Basic Link Component, Basic Usage, Client-Side Navigation, Common Pitfalls, Deferred Props, Documentation, Form Component (Recommended), Form Component Reset Props (+19 more)

### Community 7 - "VirtualTryOn"
Cohesion: 0.08
Nodes (14): PruneVirtualTryOns, VirtualTryOnController, StoreVirtualTryOnRequest, GenerateVirtualTryOn, VirtualTryOn, VirtualTryOnCatalog, VirtualTryOnClient, Illuminate\Console\Command (+6 more)

### Community 8 - "ProductVariant.php"
Cohesion: 0.15
Nodes (4): ProductVariantImage, Illuminate\Database\Eloquent\Collection, Illuminate\Database\Eloquent\Factories\HasFactory, Illuminate\Database\Eloquent\Model

### Community 9 - "dropdown-menu.tsx"
Cohesion: 0.11
Nodes (20): DropdownMenu(), DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuGroup(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator() (+12 more)

### Community 10 - "Product"
Cohesion: 0.22
Nodes (3): ProductController, Product, Illuminate\Database\Eloquent\Relations\BelongsToMany

### Community 11 - "use-appearance.tsx"
Cohesion: 0.11
Nodes (24): AppearanceToggleTab(), TwoFactorSetupStep(), Toaster(), Appearance, applyTheme(), getStoredAppearance(), handleSystemThemeChange(), initializeTheme() (+16 more)

### Community 12 - "Pest 5 Features"
Cohesion: 0.10
Nodes (19): Architecture Testing, Assertions, Basic Test Structure, Basic Usage, Browser Test Example, Common Pitfalls, Creating Tests, Datasets (+11 more)

### Community 13 - "compilerOptions"
Cohesion: 0.10
Nodes (19): resources/js/**/*.d.ts, resources/js/**/*.ts, resources/js/**/*.tsx, compilerOptions, allowJs, baseUrl, esModuleInterop, forceConsistentCasingInFileNames (+11 more)

### Community 15 - "User.php"
Cohesion: 0.12
Nodes (8): User, Illuminate\Contracts\Auth\MustVerifyEmail, Illuminate\Foundation\Auth\User, Illuminate\Notifications\Notifiable, Laravel\Fortify\Contracts\PasskeyUser, Laravel\Fortify\PasskeyAuthenticatable, Laravel\Fortify\TwoFactorAuthenticatable, Spatie\Permission\Traits\HasRoles

### Community 16 - "components.json"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 17 - "Laravel Fortify Development"
Cohesion: 0.12
Nodes (16): Available Features, Best Practices, Custom Authentication Logic, Documentation, Email Verification Setup, Key Endpoints, Laravel Fortify Development, Passkeys Setup (+8 more)

### Community 18 - "button.tsx"
Cohesion: 0.11
Nodes (22): DeleteUser(), Heading(), InputError(), ManagePasskeys(), Props, PasskeyItem(), PasskeyRegistration(), Props (+14 more)

### Community 19 - "ProductVariant"
Cohesion: 0.14
Nodes (5): ProductVariant, ProductVariantImageFactory, VirtualTryOnFactory, Illuminate\Database\Eloquent\Relations\HasMany, tryOnVariant()

### Community 21 - "devDependencies"
Cohesion: 0.13
Nodes (15): babel-plugin-react-compiler, eslint-config-prettier, eslint-import-resolver-typescript, @laravel/vite-plugin-wayfinder, devDependencies, babel-plugin-react-compiler, eslint, eslint-config-prettier (+7 more)

### Community 22 - "Tailwind CSS Development"
Cohesion: 0.14
Nodes (13): Basic Usage, Common Patterns, Common Pitfalls, CSS-First Configuration, Dark Mode, Documentation, Flexbox Layout, Grid Layout (+5 more)

### Community 23 - "banners/index.tsx"
Cohesion: 0.20
Nodes (13): Textarea(), AdminBannersIndex(), Banner, bannerFileExtension(), BannerFormData, bannerUploadTypes, canvasBlob(), drawBannerImage() (+5 more)

### Community 24 - "app-header.tsx"
Cohesion: 0.14
Nodes (17): mainNavItems, Props, rightNavItems, Avatar(), AvatarFallback(), AvatarImage(), Sheet(), SheetContent() (+9 more)

### Community 25 - "Controller"
Cohesion: 0.13
Nodes (12): AccessControlController, CampaignController, CustomerController, DashboardController, InventoryController, OrderController, ProductCategoryController, ProductController (+4 more)

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

### Community 35 - "campaigns/index.tsx"
Cohesion: 0.12
Nodes (23): AdminPagination(), AdminPaginationProps, pageNumbers(), pageUrl(), Badge(), badgeVariants, Select(), SelectContent() (+15 more)

### Community 36 - "Queue & Job Best Practices"
Cohesion: 0.18
Nodes (10): Always Implement `failed()`, Batch Related Jobs, Implement `ShouldBeUnique`, Queue & Job Best Practices, Rate Limit External API Calls in Jobs, `retryUntil()` Needs `$tries = 0`, Set `retry_after` Greater Than `timeout`, Use Exponential Backoff (+2 more)

### Community 37 - "inventory/index.tsx"
Cohesion: 0.17
Nodes (14): AdminInventoryIndex(), emptyMovement, formatDateTime(), InventoryData, inventoryListingUrl(), InventoryMetrics, InventoryMovement, MovementFormData (+6 more)

### Community 38 - "admin/dashboard.tsx"
Cohesion: 0.08
Nodes (43): AdminApiState(), Props, AdminPaginationMeta, Props, Card(), CardContent(), CardDescription(), CardHeader() (+35 more)

### Community 39 - "AdminPanelTest.php"
Cohesion: 0.20
Nodes (5): UpdateOrderRequest, OrderFactory, colorImageUrls(), productPayload(), variantsPayload()

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
Nodes (9): class-variance-authority, concurrently, @inertiajs/vite, laravel-vite-plugin, dependencies, class-variance-authority, concurrently, @inertiajs/vite (+1 more)

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

### Community 59 - "Order"
Cohesion: 0.16
Nodes (9): CreateCheckoutOrder, OrderController, OrderConfirmation, Order, Illuminate\Bus\Queueable, Illuminate\Mail\Mailable, Illuminate\Mail\Mailables\Content, Illuminate\Mail\Mailables\Envelope (+1 more)

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

### Community 65 - "FortifyServiceProvider.php"
Cohesion: 0.20
Nodes (3): AppServiceProvider, FortifyServiceProvider, Illuminate\Support\ServiceProvider

### Community 66 - "welcome.tsx"
Cohesion: 0.12
Nodes (19): benefits, categoryHref(), fallbackImages, footerColumns, formatPrice(), imageFor(), navigationItems, PaginatedProducts (+11 more)

### Community 68 - "InventoryMovement"
Cohesion: 0.18
Nodes (5): RecordInventoryMovement, InventoryController, InventoryMovement, Illuminate\Database\Eloquent\Relations\BelongsTo, InventoryMovementType

### Community 71 - "psr-4"
Cohesion: 0.40
Nodes (5): autoload, psr-4, App\\, Database\\Factories\\, Database\\Seeders\\

### Community 72 - "laravel"
Cohesion: 0.40
Nodes (5): extra, laravel, post-create-project, dont-discover, installer

### Community 73 - "Illuminate\Database\Console\Seeds\WithoutModelEvents"
Cohesion: 0.24
Nodes (7): AdminUserSeeder, DatabaseSeeder, EmployeeUserSeeder, RolePermissionSeeder, StorefrontBannerSeeder, Illuminate\Database\Console\Seeds\WithoutModelEvents, Illuminate\Database\Seeder

### Community 75 - "ServerTest"
Cohesion: 0.12
Nodes (10): FastAPI, Image, create_app(), decode_image(), FashnEngine, Private FASHN adapter. Run one process per GPU behind a private network. python…, validate_pose(), FakeEngine (+2 more)

### Community 78 - "autoload-dev"
Cohesion: 0.67
Nodes (3): autoload-dev, psr-4, Tests\\

### Community 79 - "keywords"
Cohesion: 0.67
Nodes (3): keywords, framework, laravel

### Community 94 - "ProductCampaignPrice"
Cohesion: 0.18
Nodes (3): HomeController, ProductShowController, ProductCampaignPrice

### Community 95 - "two-factor-setup-modal.tsx"
Cohesion: 0.17
Nodes (12): ManageTwoFactor(), Props, TwoFactorRecoveryCodes(), Props, TwoFactorSetupModal(), InputOTP, InputOTPGroup, InputOTPSeparator (+4 more)

### Community 97 - "Illuminate\Http\JsonResponse"
Cohesion: 0.19
Nodes (5): CustomerController, ProductCategoryController, UpdateProductCategoryRequest, ProductCategory, Illuminate\Http\JsonResponse

### Community 100 - "products/index.tsx"
Cohesion: 0.14
Nodes (19): Checkbox(), AdminProductsIndex(), CategoryOption, centsToPrice(), colorsFromVariants(), makeEmptyColor(), makeEmptyProduct(), Product (+11 more)

### Community 101 - "Api/Admin/DashboardController.php"
Cohesion: 0.23
Nodes (4): DashboardController, OrderItem, Carbon\CarbonInterface, Illuminate\Database\Eloquent\Builder

### Community 103 - "sidebar.tsx"
Cohesion: 0.11
Nodes (28): AdminNavSection, adminNavSections, NavUser(), SheetDescription(), Sidebar(), SidebarContent(), SidebarContext, SidebarFooter() (+20 more)

### Community 104 - "categories/index.tsx"
Cohesion: 0.21
Nodes (16): Props, Dialog(), DialogClose(), DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogTitle() (+8 more)

### Community 111 - "Campaign"
Cohesion: 0.16
Nodes (5): SaveCampaign, CampaignController, StoreCampaignRequest, UpdateCampaignRequest, Campaign

### Community 112 - "Illuminate\Foundation\Http\FormRequest"
Cohesion: 0.12
Nodes (5): StorePermissionRequest, StoreProductCategoryRequest, StoreRoleRequest, UpdatePermissionRequest, Illuminate\Foundation\Http\FormRequest

### Community 115 - "show.tsx"
Cohesion: 0.19
Nodes (14): VirtualTryOn(), fallbackImages, formatPrice(), imageFor(), navigationItems, Product, ProductColor, ProductTile() (+6 more)

### Community 117 - "app-sidebar.tsx"
Cohesion: 0.14
Nodes (18): AppContent(), Props, AppShell(), Props, AppSidebar(), footerNavItems, AppSidebarHeader(), mainNavItems (+10 more)

### Community 122 - "cn"
Cohesion: 0.11
Nodes (29): AppHeader(), Breadcrumb(), BreadcrumbEllipsis(), BreadcrumbItem(), BreadcrumbLink(), BreadcrumbList(), BreadcrumbPage(), BreadcrumbSeparator() (+21 more)

### Community 123 - "Spatie\Permission\Models\Role"
Cohesion: 0.16
Nodes (6): PermissionController, RoleController, Permission, Role, Spatie\Permission\Models\Permission, Spatie\Permission\Models\Role

### Community 124 - "Illuminate\Http\RedirectResponse"
Cohesion: 0.19
Nodes (4): CartItemController, ProfileController, SecurityController, Illuminate\Http\RedirectResponse

### Community 131 - "ProfileValidationRules.php"
Cohesion: 0.27
Nodes (6): CreateNewUser, emailRules(), nameRules(), profileRules(), ProfileUpdateRequest, Laravel\Fortify\Contracts\CreatesNewUsers

### Community 138 - "Illuminate\Contracts\Validation\ValidationRule"
Cohesion: 0.25
Nodes (3): PasswordUpdateRequest, ProfileDeleteRequest, Illuminate\Contracts\Validation\ValidationRule

### Community 151 - "thank-you.tsx"
Cohesion: 0.50
Nodes (4): formatPrice(), Order, Props, ThankYou()

### Community 152 - "Illuminate\Http\Request"
Cohesion: 0.21
Nodes (9): EnsureUserIsAdmin, HandleAppearance, HandleInertiaRequests, SecurityHeaders, Closure, Illuminate\Foundation\Configuration\Middleware, Illuminate\Http\Request, Inertia\Middleware (+1 more)

### Community 153 - "package.json"
Cohesion: 0.50
Nodes (3): private, $schema, type

### Community 156 - "auth.ts"
Cohesion: 0.22
Nodes (9): Auth, Passkey, TwoFactorSecretKey, TwoFactorSetupData, User, InertiaConfig, @inertiajs/core, InputHTMLAttributes (+1 more)

### Community 160 - "brand-logo.tsx"
Cohesion: 0.28
Nodes (7): BrandLogo(), BrandLogoProps, logoSources, Cart(), CartItem, formatPrice(), Props

### Community 161 - "alert-error.tsx"
Cohesion: 0.48
Nodes (5): AlertError(), Alert(), AlertDescription(), AlertTitle(), alertVariants

### Community 163 - "CheckoutController.php"
Cohesion: 0.13
Nodes (5): CartController, CheckoutController, StoreCheckoutRequest, PriceCartItems, Illuminate\Support\Collection

### Community 165 - "checkout.tsx"
Cohesion: 0.38
Nodes (6): CartItem, Checkout(), CheckoutForm, fieldLabel(), formatPrice(), Props

### Community 181 - "Illuminate\Database\Eloquent\Factories\Factory"
Cohesion: 0.11
Nodes (9): CampaignFactory, InventoryMovementFactory, static, OrderItemFactory, ProductCategoryFactory, ProductFactory, ProductVariantFactory, StorefrontBannerFactory (+1 more)

### Community 191 - "app.tsx"
Cohesion: 0.15
Nodes (10): AppLogo(), AppLogoIcon(), Tooltip(), TooltipContent(), TooltipProvider(), TooltipTrigger(), AppLayout(), AuthSimpleLayout() (+2 more)

### Community 192 - "Js Pages Products"
Cohesion: 0.50
Nodes (3): Generation must use real inference, Js Pages Products, Local preview may skip garment images

### Community 199 - "bannerTitleLines"
Cohesion: 0.50
Nodes (4): bannerTitleLines(), BottomCampaign(), HeroCarousel(), useCarouselIndex()

## Knowledge Gaps
- **564 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+559 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **68 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Permission` connect `Spatie\Permission\Models\Role` to `admin/dashboard.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `Role` connect `Spatie\Permission\Models\Role` to `admin/dashboard.tsx`?**
  _High betweenness centrality (0.079) - this node is a cross-community bridge._
- **Why does `cn()` connect `cn` to `brand-logo.tsx`, `alert-error.tsx`, `utils.ts`, `campaigns/index.tsx`, `products/index.tsx`, `app.tsx`, `admin/dashboard.tsx`, `sidebar.tsx`, `categories/index.tsx`, `dropdown-menu.tsx`, `use-appearance.tsx`, `button.tsx`, `app-sidebar.tsx`, `banners/index.tsx`, `app-header.tsx`, `two-factor-setup-modal.tsx`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **Are the 6 inferred relationships involving `Product` (e.g. with `.index()` and `.__invoke()`) actually correct?**
  _`Product` has 6 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _564 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `StorefrontBanner` be split into smaller, more focused modules?**
  _Cohesion score 0.10582010582010581 - nodes in this community are weakly interconnected._
- **Should `scripts` be split into smaller, more focused modules?**
  _Cohesion score 0.052564102564102565 - nodes in this community are weakly interconnected._