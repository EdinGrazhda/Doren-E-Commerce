<?php

return [
    'canonical_url' => rtrim(env('SEO_CANONICAL_URL', env('APP_URL', 'http://localhost')), '/'),
    'indexing_enabled' => (bool) env('SEO_INDEXING_ENABLED', true),
    'locale' => env('SEO_LOCALE', env('APP_LOCALE', 'en')),
    'site_name' => env('SEO_SITE_NAME', 'Doren Menswear'),
    'audit' => [
        'enabled' => (bool) env('SEO_AUDIT_ENABLED', false),
        'product_limit' => (int) env('SEO_AUDIT_PRODUCT_LIMIT', 1000),
        'history_limit' => (int) env('SEO_AUDIT_HISTORY_LIMIT', 20),
    ],
    'sitemap' => [
        'page_size' => (int) env('SEO_SITEMAP_PAGE_SIZE', 10000),
    ],
];
