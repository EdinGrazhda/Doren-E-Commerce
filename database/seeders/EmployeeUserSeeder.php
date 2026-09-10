<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use RuntimeException;
use Spatie\Permission\Models\Role;

class EmployeeUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = env('EMPLOYEE_PASSWORD');

        if (app()->isProduction() && blank($password)) {
            throw new RuntimeException('EMPLOYEE_PASSWORD must be set before seeding the production employee user.');
        }

        $employee = User::firstOrNew([
            'email' => env('EMPLOYEE_EMAIL', 'employee@doren.test'),
        ]);

        $employee->forceFill([
            'name' => env('EMPLOYEE_NAME', 'Doren Employee'),
            'password' => $password ?: 'password',
            'email_verified_at' => now(),
            'is_admin' => false,
        ])->save();

        $employee->syncRoles([Role::findOrCreate('employee')]);
    }
}
