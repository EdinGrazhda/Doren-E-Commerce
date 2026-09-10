<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePermissionRequest;
use App\Http\Requests\Admin\UpdatePermissionRequest;
use Illuminate\Http\JsonResponse;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    private const CORE_PERMISSIONS = [
        'dashboard.view',
        'orders.view', 'orders.manage',
        'products.view', 'products.manage',
        'categories.view', 'categories.manage',
        'inventory.view', 'inventory.manage',
        'campaigns.view', 'campaigns.manage',
        'sales.view',
        'customers.view',
        'banners.view', 'banners.manage',
        'settings.view',
        'storefront.view',
        'roles.manage',
        'permissions.manage',
    ];

    public function index(): JsonResponse
    {
        return response()->json(['data' => [
            'permissions' => Permission::query()->withCount('roles')->orderBy('name')->get(),
        ]]);
    }

    public function store(StorePermissionRequest $request): JsonResponse
    {
        $permission = Permission::create(['name' => $request->validated('name'), 'guard_name' => 'web']);

        return response()->json(['data' => $permission, 'message' => 'Permission created.'], 201);
    }

    public function update(UpdatePermissionRequest $request, Permission $permission): JsonResponse
    {
        abort_if(in_array($permission->name, self::CORE_PERMISSIONS, true) && $request->validated('name') !== $permission->name, 422, 'Core permissions cannot be renamed.');

        $permission->update(['name' => $request->validated('name')]);

        return response()->json(['data' => $permission, 'message' => 'Permission updated.']);
    }

    public function destroy(Permission $permission): JsonResponse
    {
        abort_if(in_array($permission->name, self::CORE_PERMISSIONS, true), 422, 'Core permissions cannot be deleted.');

        $permission->delete();

        return response()->json(['message' => 'Permission deleted.']);
    }
}
