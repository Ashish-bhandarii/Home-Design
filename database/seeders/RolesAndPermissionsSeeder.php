<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Create permissions
        $permissions = [
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            
            // Design Management
            'view designs',
            'create designs',
            'edit designs',
            'delete designs',
            'publish designs',
            
            // Floor Plan Management
            'view floor-plans',
            'create floor-plans',
            'edit floor-plans',
            'delete floor-plans',
            
            // Interior Design Management
            'view interior-designs',
            'create interior-designs',
            'edit interior-designs',
            'delete interior-designs',
            
            // Material Management
            'view materials',
            'create materials',
            'edit materials',
            'delete materials',
            
            // Furniture Management
            'view furniture',
            'create furniture',
            'edit furniture',
            'delete furniture',
            
            // Settings Management
            'view settings',
            'edit settings',
            
            // Analytics
            'view analytics',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create roles and assign permissions
        
        // Admin role - has all permissions
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->syncPermissions(Permission::all());

        // User role - limited permissions
        $userRole = Role::firstOrCreate(['name' => 'user']);
        $userRole->syncPermissions([
            'view designs',
            'create designs',
            'edit designs',
            'delete designs',
            'view floor-plans',
            'create floor-plans',
            'edit floor-plans',
            'delete floor-plans',
            'view interior-designs',
            'create interior-designs',
            'edit interior-designs',
            'delete interior-designs',
            'view materials',
            'view furniture',
        ]);

        // Designer role - professional designers who can be hired for consultations
        $designerRole = Role::firstOrCreate(['name' => 'designer']);
        $designerRole->syncPermissions([
            'view designs',
            'create designs',
            'edit designs',
            'delete designs',
            'publish designs',
            'view floor-plans',
            'create floor-plans',
            'edit floor-plans',
            'delete floor-plans',
            'view interior-designs',
            'create interior-designs',
            'edit interior-designs',
            'delete interior-designs',
            'view materials',
            'create materials',
            'edit materials',
            'delete materials',
            'view furniture',
            'create furniture',
            'edit furniture',
            'delete furniture',
        ]);
    }
}
