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
        'dashboard.read',
        'orders.create', 'orders.read', 'orders.update', 'orders.delete',
        'products.create', 'products.read', 'products.update', 'products.delete',
        'categories.create', 'categories.read', 'categories.update', 'categories.delete',
        'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
        'sales.read', 'customers.read',
        'banners.create', 'banners.read', 'banners.update', 'banners.delete',
        'roles.create', 'roles.read', 'roles.update', 'roles.delete',
        'permissions.create', 'permissions.read', 'permissions.update', 'permissions.delete',
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
