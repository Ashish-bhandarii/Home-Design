# Roles and Permissions Implementation Guide

This document outlines the steps to complete the roles and permissions setup using Spatie Laravel Permission package.

## Installation Steps

### 1. Install Spatie Laravel Permission Package

Run the following command in your terminal:

```bash
composer require spatie/laravel-permission
```

### 2. Publish the Configuration and Migrations

```bash
php artisan vendor:publish --provider="Spatie\Permission\PermissionServiceProvider"
```

### 3. Run Migrations

```bash
php artisan migrate
```

This will create the following tables:
- `roles`
- `permissions`
- `model_has_permissions`
- `model_has_roles`
- `role_has_permissions`

### 4. Clear Cache

```bash
php artisan optimize:clear
```

### 5. Seed Roles and Permissions

```bash
php artisan db:seed --class=RolesAndPermissionsSeeder
```

Or run all seeders:

```bash
php artisan db:seed
```

## What Has Been Implemented

### 1. User Model
- Added `HasRoles` trait from Spatie package
- Users can now have multiple roles and permissions

### 2. Roles & Permissions Seeder
Created comprehensive permission structure:

**Roles:**
- **Admin**: Full access to everything
- **User**: Can create and manage their own designs
- **Editor**: Can manage content but not users or settings

**Permission Categories:**
- User Management (view, create, edit, delete users)
- Home Designs (view, create, edit, delete, publish)
- Floor Plans (view, create, edit, delete, publish)
- Interior Designs (view, create, edit, delete, publish)
- Materials (view, create, edit, delete, manage catalog)
- Furniture (view, create, edit, delete, manage catalog)
- Settings (view, edit site settings)
- Analytics (view analytics)

### 3. Database Seeder
Updated to:
- Call `RolesAndPermissionsSeeder` first
- Create 3 users: admin, test user, and editor
- Assign appropriate roles using `assignRole()`

### 4. Authentication
Updated `AppServiceProvider`:
- Login redirects now use `hasRole('admin')` instead of string comparison
- Register redirects also use Spatie methods

### 5. Admin Middleware
Updated `AdminMiddleware`:
- Now checks `hasRole('admin')` instead of `role === 'admin'`

## Using Permissions in Your Code

### Check if user has a role:
```php
if ($user->hasRole('admin')) {
    // Do something
}
```

### Check if user has a permission:
```php
if ($user->can('edit-users')) {
    // User can edit users
}
```

### Check multiple permissions:
```php
if ($user->hasAnyPermission(['edit-users', 'delete-users'])) {
    // User has at least one permission
}

if ($user->hasAllPermissions(['view-users', 'edit-users'])) {
    // User has all permissions
}
```

### In Blade/Inertia:
```php
@can('edit-users')
    <!-- Show edit button -->
@endcan

@role('admin')
    <!-- Show admin content -->
@endrole
```

### Protect Routes with Middleware:
```php
// Single permission
Route::get('/admin/users', [UsersController::class, 'index'])
    ->middleware('permission:view-users');

// Multiple permissions (user needs ALL)
Route::post('/admin/users', [UsersController::class, 'store'])
    ->middleware('permission:create-users,edit-users');

// Multiple permissions (user needs ANY)
Route::get('/admin/content', [ContentController::class, 'index'])
    ->middleware('permission:view-home-designs|view-interior-designs');

// Role-based
Route::get('/admin', [AdminController::class, 'dashboard'])
    ->middleware('role:admin');
```

### Assign/Remove Roles and Permissions:
```php
// Assign role
$user->assignRole('admin');
$user->assignRole(['admin', 'editor']);

// Remove role
$user->removeRole('admin');

// Sync roles (removes all existing and adds new)
$user->syncRoles(['editor']);

// Give permission
$user->givePermissionTo('edit-users');

// Revoke permission
$user->revokePermissionTo('edit-users');
```

## Current User Credentials

After seeding, you'll have these users:

| Email | Password | Role |
|-------|----------|------|
| admin@design.com | password | admin |
| test@example.com | password | user |
| editor@design.com | password | editor |

## Next Steps (Optional Enhancements)

1. **Update Controllers** to check permissions before actions:
```php
public function destroy(User $user)
{
    $this->authorize('delete-users');
    // Or: if (!auth()->user()->can('delete-users')) { abort(403); }
    
    $user->delete();
    return redirect()->route('admin.users.index');
}
```

2. **Update Frontend** to conditionally show/hide UI elements based on permissions

3. **Add Permission Middleware** to specific routes for granular control

4. **Create Role Management UI** in admin panel to assign roles to users

5. **Add Permission Gates** in `AuthServiceProvider` for complex permission logic

## Troubleshooting

If you encounter cache issues:
```bash
php artisan cache:forget spatie.permission.cache
php artisan optimize:clear
```

If roles/permissions aren't working:
```bash
php artisan config:clear
php artisan cache:clear
composer dump-autoload
```

## Documentation

For more information, visit:
- [Spatie Laravel Permission Documentation](https://spatie.be/docs/laravel-permission)
