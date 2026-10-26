# SEO workflow

The storefront uses Laravel and Inertia React 3. Product and collection pages use the existing catalog as their source of truth; English is the configured site language. Product pages and the home page use server-rendered Inertia head metadata so titles, descriptions, canonical links, Open Graph tags, robots directives and JSON-LD update both on the first response and on client navigation.

`SEO_CANONICAL_URL` sets the public canonical origin and falls back to `APP_URL`. `SEO_INDEXING_ENABLED` defaults to `true` to preserve the current public indexing policy; set it to `false` deliberately when the deployment must not be indexed. `SEO_LOCALE` and `SEO_SITE_NAME` provide metadata defaults. Keep the value of `SEO_CANONICAL_URL` aligned with the verified public host and TLS configuration.

The XML sitemap includes the home page, visible collections with active products, and active product pages. It streams a normal URL set while the catalog fits within the configured size. Larger catalogs use a sitemap index with paginated child sitemaps. `SEO_SITEMAP_PAGE_SIZE` sets the child-file limit and is capped at 10,000 URLs.

The admin SEO page is available at `/dashboard/seo` to users with `seo.read`. Starting an audit additionally requires `seo.run`. Administrators receive both through the existing administrator permission bypass; seed `RolePermissionSeeder` to register the permissions in a fresh environment. The audit command is `php artisan seo:audit`; it checks a bounded number of active catalog products, their visible collections, metadata inputs, sitemap route, robots file, canonical origin and SSR setting. It stores findings in `seo_audit_runs` and does not crawl external sites or inspect customer/order data.

Scheduled daily audits are opt-in: set `SEO_AUDIT_ENABLED=true` and run Laravel's scheduler and queue worker. The command can also run a one-off synchronous audit with `php artisan seo:audit --sync`. `SEO_AUDIT_PRODUCT_LIMIT` defaults to 1,000 catalog products per run. `SEO_AUDIT_HISTORY_LIMIT` defaults to 20 runs shown in the admin page. No database migration has been run as part of this code change; apply migrations through the project's normal deployment process.

No Search Console, keyword-volume, rankings, revenue-attribution, or AI citation data is imported. The root view already contains a GA4 tag, but this audit does not validate its consent behavior, property access, or conversion-event configuration. The storefront has no verified translation set or language-region routing, so it publishes no hreflang links. Any current location and delivery statements are existing application content and require business-owner verification before expanding them.

## Run checks

```bash
php artisan test --compact tests/Feature/StorefrontHomeTest.php
php artisan test --compact tests/Feature/StorefrontProductShowTest.php
php artisan test --compact tests/Feature/SitemapTest.php
php artisan test --compact tests/Feature/SeoAutomationTest.php
```

The Inertia SSR build and process must be available in the production runtime for rendered React body content. Follow the repository's existing Vite and deployment setup when building and operating it.
