<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRoleRequest;
use App\Http\Requests\Admin\UpdateRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        $roleUserCounts = DB::table(config('permission.table_names.model_has_roles'))
            ->selectRaw('role_id, COUNT(*) as users_count')
            ->groupBy('role_id')
            ->pluck('users_count', 'role_id');

        $roles = Role::query()
            ->with('permissions:id,name')
            ->orderBy('name')
            ->get()
            ->each(fn (Role $role) => $role->setAttribute('users_count', (int) ($roleUserCounts[$role->id] ?? 0)));

        return response()->json(['data' => [
            'roles' => $roles,
            'permissions' => Permission::query()->orderBy('name')->get(['id', 'name']),
        ]]);
    }

    public function store(StoreRoleRequest $request): JsonResponse
    {
        $role = Role::create(['name' => $request->validated('name'), 'guard_name' => 'web']);
        $role->syncPermissions(Permission::query()->whereIn('name', $request->validated('permissions', []))->where('guard_name', 'web')->get());

        return response()->json(['data' => $role->load('permissions'), 'message' => 'Role created.'], 201);
    }

    public function update(UpdateRoleRequest $request, Role $role): JsonResponse
    {
        abort_if(in_array($role->name, ['admin', 'employee'], true) && $request->validated('name') !== $role->name, 422, 'Built-in roles cannot be renamed.');

        $role->update(['name' => $request->validated('name')]);
        $role->syncPermissions(Permission::query()->whereIn('name', $request->validated('permissions', []))->where('guard_name', 'web')->get());

        return response()->json(['data' => $role->load('permissions'), 'message' => 'Role updated.']);
    }

    public function destroy(Role $role): JsonResponse
    {
        abort_if(in_array($role->name, ['admin', 'employee'], true), 422, 'Built-in roles cannot be deleted.');

        $role->delete();

        return response()->json(['message' => 'Role deleted.']);
    }
}
