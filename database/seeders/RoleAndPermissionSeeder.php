<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

class RoleAndPermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        app()[PermissionRegistrar::class]->forgetCachedPermissions();

        $permissions = [
            // Pacientes
            'view_patients',
            'create_patients',
            'edit_patients',
            'delete_patients',

            // Expediente Clínico (exclusivo médicos)
            'manage_medical_records',
            'manage_orthodontic_notes',

            // Anexos y Contratos
            'manage_attachments',
            'manage_contracts',

            // Agenda y Citas
            'manage_own_schedule',
            'view_appointments',
            'create_appointments',
            'edit_appointments',
            'delete_appointments',

            // Finanzas Operativas (caja)
            'manage_billing', // Agregar servicios y cobros a las citas

            // Catálogos y Administración
            'manage_services',
            'manage_payment_methods',
            'manage_specialties',

            // Usuarios y Seguridad
            'manage_staff',
            'manage_doctors',
            'view_audit_logs',
            'manage_clinic_settings',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // --- ROL: SUPER ADMIN ---
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin']);
        $superAdmin->syncPermissions(Permission::all());

        // --- ROL: ADMIN ---
        $admin = Role::firstOrCreate(['name' => 'admin']);
        $admin->syncPermissions(Permission::all()->reject(function ($permission) {
            return $permission->name === 'delete_patients';
        }));

        // --- ROL: DOCTOR ---
        $doctor = Role::firstOrCreate(['name' => 'doctor']);
        $doctor->syncPermissions([
            'view_patients',
            'create_patients',
            'edit_patients',
            'manage_medical_records',
            'manage_orthodontic_notes',
            'manage_attachments',
            'manage_contracts',
            'manage_own_schedule',
            'view_appointments',
            'create_appointments',
            'edit_appointments',
            'manage_billing',
        ]);

        // --- ROL: ASISTENTE ---
        $assistant = Role::firstOrCreate(['name' => 'assistant']);
        $assistant->syncPermissions([
            'view_patients',
            'create_patients',
            'edit_patients',
            'manage_attachments',
            'manage_contracts',
            'view_appointments',
            'create_appointments',
            'edit_appointments',
            'delete_appointments',
            'manage_billing',
        ]);
    }
}
