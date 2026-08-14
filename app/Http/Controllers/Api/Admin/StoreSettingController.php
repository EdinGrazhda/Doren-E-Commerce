<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;

class StoreSettingController extends Controller
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'data' => [
                'settings' => [
                    'store_name' => 'Doren',
                    'currency' => 'USD',
                    'guest_checkout' => true,
                    'admin_accounts' => true,
                ],
            ],
        ]);
    }
}
