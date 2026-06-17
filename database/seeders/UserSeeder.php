<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $superAdmin = User::firstOrCreate(
            ['email' => 'soporte@doctime.com.mx'],
            [
                'name' => 'Soporte',
                'password' => Hash::make('/134Cq24'),
                'email_verified_at' => now(),
            ]
        );

        if (!$superAdmin->hasRole('super_admin')) {
            $superAdmin->assignRole('super_admin');
        }

        $admin = User::firstOrCreate(
            ['email' => 'gestapillo54@gmail.com'],
            [
                'name' => 'Daniel Velazquez',
                'password' => Hash::make('admin'),
                'email_verified_at' => now(),
            ]
        );

        if (!$admin->hasRole('super_admin')) {
            $admin->assignRole('super_admin');
        }

        $this->command->info('Usuarios Super Admin creados correctamente.');
    }
}
