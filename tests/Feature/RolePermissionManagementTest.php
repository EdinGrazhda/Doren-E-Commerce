<?php

use App\Models\User;
use Database\Seeders\EmployeeUserSeeder;
use Database\Seeders\RolePermissionSeeder;
use Inertia\Testing\AssertableInertia as Assert;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    $this->seed(RolePermissionSeeder::class);
});

test('employees can authenticate and are redirected to commerce', function () {
    $employee = User::factory()->employee()->create(['password' => 'password']);

    $this->post(route('login'), ['email' => $employee->email, 'password' => 'password'])
        ->assertRedirect(route('dashboard'));

    $this->actingAs($employee)->get(route('dashboard'))
        ->assertRedirect(route('dashboard.orders.index'));
});

test('employees can only access commerce panel sections', function (string $routeName, bool $allowed) {
    $employee = User::factory()->employee()->create();
    $response = $this->actingAs($employee)->get(route($routeName));

    $allowed ? $response->assertSuccessful() : $response->assertForbidden();
})->with([
    'orders' => ['dashboard.orders.index', true],
    'products' => ['dashboard.products.index', true],
    'categories' => ['dashboard.categories.index', true],
    'inventory' => ['dashboard.inventory', true],
    'campaigns' => ['dashboard.campaigns.index', false],
    'sales' => ['dashboard.sales', false],
    'customers' => ['dashboard.customers.index', false],
    'banners' => ['dashboard.banners.index', false],
    'settings' => ['dashboard.settings', false],
    'access control' => ['dashboard.access-control', false],
]);

test('employee inertia props only contain commerce permissions', function () {
    $employee = User::factory()->employee()->create();

    $this->actingAs($employee)
        ->get(route('dashboard.orders.index'))
        ->assertInertia(fn (Assert $page) => $page
            ->where('auth.user.roles', ['employee'])
            ->where('auth.user.permissions', fn ($permissions): bool => collect($permissions)->sort()->values()->all() === [
                'categories.manage',
                'categories.view',
                'inventory.manage',
                'inventory.view',
                'orders.manage',
                'orders.view',
                'products.manage',
                'products.view',
            ]));
});

test('admins can create update and delete custom roles', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->postJson(route('api.admin.roles.store'), [
        'name' => 'supervisor',
        'permissions' => ['orders.view'],
    ])->assertCreated();

    $role = Role::findByName('supervisor', 'web');
    expect($role->hasPermissionTo('orders.view'))->toBeTrue();

    $this->actingAs($admin)->putJson(route('api.admin.roles.update', $role), [
        'name' => 'store-supervisor',
        'permissions' => ['orders.view', 'customers.view'],
    ])->assertSuccessful();

    expect($role->fresh()->name)->toBe('store-supervisor')
        ->and($role->fresh()->hasPermissionTo('customers.view'))->toBeTrue();

    $this->actingAs($admin)->deleteJson(route('api.admin.roles.destroy', $role))->assertSuccessful();
    expect(Role::find($role->id))->toBeNull();
});

test('admins can list roles with their user counts', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->getJson(route('api.admin.roles.index'))
        ->assertSuccessful()
        ->assertJsonPath('data.roles.0.name', 'admin')
        ->assertJsonPath('data.roles.0.users_count', 1);
});

test('admins can create update and delete custom permissions', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->postJson(route('api.admin.permissions.store'), ['name' => 'reports.view'])->assertCreated();
    $permission = Permission::findByName('reports.view', 'web');

    $this->actingAs($admin)->putJson(route('api.admin.permissions.update', $permission), ['name' => 'reports.manage'])->assertSuccessful();
    expect($permission->fresh()->name)->toBe('reports.manage');

    $this->actingAs($admin)->deleteJson(route('api.admin.permissions.destroy', $permission))->assertSuccessful();
    expect(Permission::find($permission->id))->toBeNull();
});

test('built in roles and permissions cannot be deleted', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->deleteJson(route('api.admin.roles.destroy', Role::findByName('admin', 'web')))->assertUnprocessable();
    $this->actingAs($admin)->deleteJson(route('api.admin.permissions.destroy', Permission::findByName('orders.view', 'web')))->assertUnprocessable();
});

test('employee seeder creates a verified employee account', function () {
    $this->seed(EmployeeUserSeeder::class);
    $employee = User::where('email', 'employee@doren.test')->firstOrFail();

    expect($employee->hasRole('employee'))->toBeTrue()
        ->and($employee->hasPermissionTo('orders.view'))->toBeTrue()
        ->and($employee->email_verified_at)->not->toBeNull();
});
