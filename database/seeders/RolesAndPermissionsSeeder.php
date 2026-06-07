<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        // Admin Permissions
        $adminPermissions = [
            'view dashboard',
            'view exam seasons',
            'create exam seasons',
            'edit exam seasons',
            'delete exam seasons',
            'activate exam seasons',
            'view subjects',
            'create subjects',
            'edit subjects',
            'delete subjects',
            'view questions',
            'create questions',
            'edit questions',
            'delete questions',
            'view candidates',
            'create candidates',
            'edit candidates',
            'delete candidates',
            'monitor exams',
            'release devices',
            'view results',
            'release results',
            'view audit logs',
        ];

        foreach ($adminPermissions as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        // Create Roles and assign created permissions

        // 1. Super Admin gets everything (via Gate::before rule, but we assign here too for UI visibility)
        $superAdmin = Role::findOrCreate('super-admin', 'web');
        $superAdmin->givePermissionTo(Permission::all());

        // 2. Admin gets most things except audit logs and deleting seasons
        $admin = Role::findOrCreate('admin', 'web');
        $admin->givePermissionTo([
            'view dashboard',
            'view exam seasons',
            'create exam seasons',
            'edit exam seasons',
            'activate exam seasons',
            'view subjects',
            'create subjects',
            'edit subjects',
            'view questions',
            'create questions',
            'edit questions',
            'view candidates',
            'create candidates',
            'edit candidates',
            'monitor exams',
            'release devices',
            'view results',
            'release results',
        ]);

        // 3. Invigilator only monitors
        $invigilator = Role::findOrCreate('invigilator', 'web');
        $invigilator->givePermissionTo([
            'view dashboard',
            'monitor exams',
            'release devices',
            'view candidates',
        ]);
    }
}
