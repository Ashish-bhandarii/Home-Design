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

        // Editor user
        $editor = User::firstOrCreate(
            ['email' => 'editor@design.com'],
            [
                'name' => 'Editor',
                'password' => bcrypt('password'),
                'role' => 'editor',
                'email_verified_at' => now(),
            ]
        );
        $editor->assignRole('editor');

        $this->call([
            InteriorCatalogSeeder::class,
            FurnitureSeeder::class,
            MaterialSeeder::class,
            HomeDesignsSeeder::class,
            InteriorDesignsSeeder::class,
        ]);
    }
}
