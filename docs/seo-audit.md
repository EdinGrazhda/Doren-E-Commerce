# Initial SEO audit

This is a code and catalog-architecture audit from 2026-10-26. It does not measure live rankings, traffic, speed or search-engine coverage. The visible storefront and catalog seed data describe English-language men's clothing, a Prizren location and delivery to Kosovo, Albania and North Macedonia. Those geographic claims come from application content and have not been independently confirmed.

## Prioritized findings and changes

| Priority | Finding | Change or follow-up |
| --- | --- | --- |
| High | Titles and other search tags were generated only in the root Blade view. Inertia navigation could leave a product's title, canonical URL, robots directive and Product data on a different page. | Added server-head metadata shared on every page visit and generated from verified public catalog content. |
| High | Product structured data omitted stock availability and breadcrumbs, and was omitted when a primary image was missing. | Added price, currency, current availability, fallback social image, product entity ID and breadcrumb data. No review counts or ratings are generated. |
| Medium | Every collection and product was placed in one streamed XML sitemap, which could exceed search-engine sitemap limits as the catalog grows. | Added sitemap-index and paginated child-file responses, with inactive products and empty or hidden collections excluded. |
| Medium | Private, search and empty catalog views need an explicit noindex response so indexability remains consistent during client-side navigation. | Added a shared `noindex,follow` tag to non-indexable pages; empty collections and searches are excluded from the sitemap. |
| Medium | No internal automated record of SEO regressions existed. | Added an admin-protected, queue-backed catalog/configuration audit with capped work and findings. Daily scheduling is disabled until configured. |
| Medium | Some product detail copy asserted material and construction details for every item without corresponding catalog facts. | Removed the generic assertions and show details supported by the current product record. Add material/care fields only when the business can maintain their accuracy. |
| Medium | Several footer destinations pointed to newsletter anchors instead of useful destinations. | Replaced those links with real category links and existing contact information; no unsupported policy pages were created. |

## Existing foundations

The project already had page-specific title and description logic, Product and Organization/WebSite JSON-LD, a `/sitemap.xml` endpoint, an allow-all `robots.txt`, visible-category navigation, active-product filtering, and Inertia SSR enabled in configuration. The Vite Inertia plugin is present. The root view contains a GA4 tag; the audit page does not verify consent, ownership, or conversion events.

## Remaining checks

- Set and verify `SEO_CANONICAL_URL` against the production TLS host before deployment. The checked-in robots file names the existing `doren-ks.shop` sitemap host.
- Build and run Inertia SSR in the production runtime, then inspect the raw HTML for product text and matching head tags.
- Connect Search Console and verify submitted sitemap, indexed pages, query performance and canonical selection.
- Verify each store location, delivery market, product description, image and current offer against what customers can actually buy.
- Do not create translated pages, extra location pages, or additional language tags until valid translated content and market support exist.

Product structured data should match the visible product and active offer; Google documents the required offer price and currency and the recommended availability [here](https://developers.google.com/search/docs/appearance/structured-data/product-snippet). Google recommends fully qualified sitemap URLs and permits up to 50,000 URLs or 50 MB uncompressed per sitemap [in its sitemap guidance](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap). For paginated collections, Google recommends unique page URLs and self-canonical pagination pages [in its pagination guidance](https://developers.google.com/search/docs/specialty/ecommerce/pagination-and-incremental-page-loading). Google describes standard technical SEO and unique, useful content as the foundation for AI search inclusion, without guaranteeing citation or placement [in its AI features guidance](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide).
