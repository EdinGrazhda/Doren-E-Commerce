<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolePermissionSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $crudPermissions = collect([
            'orders',
            'products',
            'categories',
            'inventory',
            'campaigns',
            'banners',
            'roles',
            'permissions',
        ])->flatMap(fn (string $section): array => [
            "{$section}.create",
            "{$section}.read",
            "{$section}.update",
            "{$section}.delete",
        ]);

        $permissions = $crudPermissions
            ->merge(['dashboard.read', 'sales.read', 'customers.read'])
            ->map(fn (string $name): Permission => Permission::findOrCreate($name));

        Role::findOrCreate('admin')->syncPermissions($permissions);
        Role::findOrCreate('employee')->syncPermissions([
            'orders.create', 'orders.read', 'orders.update', 'orders.delete',
            'products.create', 'products.read', 'products.update', 'products.delete',
            'categories.create', 'categories.read', 'categories.update', 'categories.delete',
            'inventory.create', 'inventory.read', 'inventory.update', 'inventory.delete',
        ]);

        Permission::query()->whereIn('name', [
            'commerce.view',
            'commerce.manage',
            'configuration.view',
            'dashboard.view',
            'orders.view', 'orders.manage',
            'products.view', 'products.manage',
            'categories.view', 'categories.manage',
            'inventory.view', 'inventory.manage',
            'campaigns.view', 'campaigns.manage',
            'sales.view', 'customers.view',
            'banners.view', 'banners.manage',
            'settings.view', 'storefront.view', 'settings.read', 'storefront.read',
            'roles.manage', 'permissions.manage',
        ])->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
