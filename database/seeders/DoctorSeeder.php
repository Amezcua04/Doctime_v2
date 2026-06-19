<?php

namespace Database\Seeders;

use App\Models\MedicalProfile;
use App\Models\Specialty;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Obtenemos los IDs de las especialidades existentes.
        // Es importante tener especialidades registradas antes de correr este seeder.
        $specialties = Specialty::pluck('id');

        if ($specialties->isEmpty()) {
            $this->command->warn('No hay especialidades registradas. Por favor crea algunas o ejecuta su seeder primero.');
            return;
        }

        // 2. Generamos los 100 usuarios
        User::factory()->count(100)->create([
            'color' => fake()->hexColor(), // Genera un color aleatorio tipo #3b82f6
            'password' => Hash::make('password123'), // Contraseña conocida para pruebas
        ])->each(function ($user) use ($specialties) {

            // 3. Asignar el rol de Spatie
            $user->assignRole('doctor');

            // 4. Crear el perfil médico
            $medicalProfile = MedicalProfile::create([
                'user_id' => $user->id,
                'license' => fake()->unique()->numerify('CED-########'), // Cédula falsa
                'bio' => fake()->paragraphs(2, true), // Texto de biografía falso
                'is_public' => fake()->boolean(80), // 80% de probabilidad de ser true
                'photo_path' => null, // En seeders suele dejarse null o usar un placeholder
            ]);

            // 5. Asignar entre 1 y 3 especialidades aleatorias a este doctor
            // Tomamos un número aleatorio entre 1 y 3, PERO nunca mayor a la cantidad total de especialidades que existen.
            $take = rand(1, min(3, $specialties->count()));
            $randomSpecialties = $specialties->random($take)->toArray();
            $medicalProfile->specialties()->sync($randomSpecialties);
        });
    }
}
