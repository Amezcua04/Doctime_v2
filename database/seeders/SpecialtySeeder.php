<?php

namespace Database\Seeders;

use App\Models\Specialty;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SpecialtySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $specialties = [
            'Cardiología', 'Dermatología', 'Pediatría', 'Ginecología y Obstetricia', 'Neurología',
            'Oncología', 'Psiquiatría', 'Oftalmología', 'Otorrinolaringología', 'Traumatología y Ortopedia',
            'Gastroenterología', 'Endocrinología', 'Neumología', 'Urología', 'Nefrología',
            'Hematología', 'Infectología', 'Reumatología', 'Alergología', 'Anestesiología',
            'Cirugía General', 'Cirugía Plástica', 'Cirugía Cardiovascular', 'Medicina Interna', 'Medicina Familiar',
            'Medicina del Deporte', 'Medicina Física y Rehabilitación', 'Geriatría', 'Dermatología Pediátrica', 'Neurología Pediátrica',
            'Neonatología', 'Cardiología Intervencionista', 'Angiología', 'Coloproctología', 'Cirugía Pediátrica',
            'Medicina Crítica y Terapia Intensiva', 'Anatomía Patológica', 'Radiología e Imagen', 'Medicina Nuclear', 'Inmunología',
            'Genética Médica', 'Medicina Legal', 'Salud Pública', 'Nutriología Clínica', 'Medicina de Urgencias',
            'Patología Clínica', 'Oncología Quirúrgica', 'Neurocirugía', 'Cirugía de Tórax', 'Epidemiología'
        ];

        foreach ($specialties as $name) {
            // Simulamos la lógica del controlador para el color alternando entre aleatorios y el default
            $color = fake()->boolean(80) ? fake()->hexColor() : null;

            Specialty::create([
                'name' => $name,
                'color' => $color ?? '#3b82f6', // Si es null, aplica el color por defecto
                'is_active' => fake()->boolean(90), // 90% de probabilidad de estar activa
            ]);
        }
    }
}
