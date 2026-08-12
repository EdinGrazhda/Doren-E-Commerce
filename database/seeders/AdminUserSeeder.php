<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use RuntimeException;

class AdminUserSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = env('ADMIN_PASSWORD');

        if (app()->isProduction() && blank($password)) {
            throw new RuntimeException('ADMIN_PASSWORD must be set before seeding the production admin user.');
        }

        $user = User::firstOrNew([
            'email' => env('ADMIN_EMAIL', 'admin@doren.test'),
        ]);

        $user->forceFill([
            'name' => env('ADMIN_NAME', 'Doren Admin'),
            'password' => $password ?: 'password',
            'email_verified_at' => now(),
            'is_admin' => true,
        ])->save();
    }
}
