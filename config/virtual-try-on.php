<?php

return [
    'driver' => env('TRY_ON_DRIVER', 'service'),
    'enabled' => (bool) env('TRY_ON_ENABLED', false),
    'url' => env('TRY_ON_SERVICE_URL', 'http://127.0.0.1:8100'),
    'token' => env('TRY_ON_SERVICE_TOKEN', ''),
    'garment_photo_type' => env('TRY_ON_GARMENT_PHOTO_TYPE', 'model'),
    'remote_image_hosts' => array_filter(explode(',', env('TRY_ON_IMAGE_HOSTS', 'images.unsplash.com'))),
    'categories' => [
        'polos' => 'tops', 'knitwear' => 'tops', 'shirts' => 'tops',
        't-shirts' => 'tops', 'tops' => 'tops', 'jackets' => 'tops',
        'coats' => 'tops', 'hoodies' => 'tops', 'sweaters' => 'tops',
        'trousers' => 'bottoms', 'pants' => 'bottoms', 'jeans' => 'bottoms',
        'shorts' => 'bottoms', 'skirts' => 'bottoms', 'bottoms' => 'bottoms',
        'dresses' => 'one-pieces', 'jumpsuits' => 'one-pieces', 'one-pieces' => 'one-pieces',
    ],
    // Override by product slug for mixed categories or flat-lay photography.
    'products' => [],
];
