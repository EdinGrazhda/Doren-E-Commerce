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

        $permissions = collect([
            'dashboard.view',
            'orders.view',
            'orders.manage',
            'products.view',
            'products.manage',
            'categories.view',
            'categories.manage',
            'inventory.view',
            'inventory.manage',
            'campaigns.view',
            'campaigns.manage',
            'sales.view',
            'customers.view',
            'banners.view',
            'banners.manage',
            'settings.view',
            'storefront.view',
            'roles.manage',
            'permissions.manage',
        ])->map(fn (string $name): Permission => Permission::findOrCreate($name));

        Role::findOrCreate('admin')->syncPermissions($permissions);
        Role::findOrCreate('employee')->syncPermissions([
            'orders.view',
            'orders.manage',
            'products.view',
            'products.manage',
            'categories.view',
            'categories.manage',
            'inventory.view',
            'inventory.manage',
        ]);

        Permission::query()->whereIn('name', [
            'commerce.view',
            'commerce.manage',
            'configuration.view',
        ])->delete();

        app(PermissionRegistrar::class)->forgetCachedPermissions();
    }
}
