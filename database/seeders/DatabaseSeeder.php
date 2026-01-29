<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call([
            RolesAndPermissionsSeeder::class,
        ]);

        // Admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@design.com'],
            [
                'name' => 'Admin',
                'password' => bcrypt('password'),
                'role' => 'admin',
                'email_verified_at' => now(),
            ]
        );
        $admin->assignRole('admin');

        // Test user
        $user = User::firstOrCreate(
            ['email' => 'test@example.com'],
            [
                'name' => 'Test User',
                'password' => bcrypt('password'),
                'role' => 'user',
                'email_verified_at' => now(),
            ]
        );
        $user->assignRole('user');

        // Designer user
        $designer = User::firstOrCreate(
            ['email' => 'designer@design.com'],
            [
                'name' => 'Designer',
                'password' => bcrypt('password'),
                'role' => 'designer',
                'specialty' => 'Interior Design',
                'bio' => 'Professional interior designer with 5 years of experience.',
                'hourly_rate' => 2500,
                'experience_years' => 5,
                'is_available' => true,
                'email_verified_at' => now(),
            ]
        );
        $designer->assignRole('designer');

        $this->call([
            InteriorCatalogSeeder::class,
            FurnitureSeeder::class,
            MaterialSeeder::class,
            HomeDesignsSeeder::class,
            InteriorDesignsSeeder::class,
        ]);
    }
}
