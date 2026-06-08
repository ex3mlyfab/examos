<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class SuperAdminSeeder extends Seeder
{
    public function run(): void
    {
        $superAdmin = App\Models\User::firstOrCreate([
            'email' => 'admin@examos.test',
        ], [
            'name' => 'Examos Super Admin',
            'password' => Hash::make('password'),
        ]);

        $superAdmin->assignRole('super-admin');
    }
}
