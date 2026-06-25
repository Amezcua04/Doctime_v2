<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class DentalCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Definir las Categorías (Especialidades Dentales)
        $categories = [
            ['id' => 1, 'name' => 'Odontología General y Preventiva', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Endodoncia', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Cirugía Oral y Maxilofacial', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Prótesis y Rehabilitación Oral', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Periodoncia', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'name' => 'Ortodoncia', 'created_at' => now(), 'updated_at' => now()],
        ];

        DB::table('treatment_categories')->insert($categories);

        // 2. Definir los Ítems del Catálogo (Solo Tratamientos)
        $catalogItems = [
            // ==========================================
            // ODONTOLOGÍA GENERAL Y PREVENTIVA (ID: 1)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 1,
                'name' => 'Resina Compuesta (1-2 Caras)',
                'requires_surface' => true,
                'default_cost' => 850.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 1,
                'name' => 'Limpieza Dental Profunda (Profilaxis)',
                'requires_surface' => false,
                'default_cost' => 600.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 1,
                'name' => 'Aplicación de Selladores de Fosetas y Fisuras',
                'requires_surface' => true,
                'default_cost' => 350.00,
                'created_at' => now(), 'updated_at' => now()
            ],

            // ==========================================
            // ENDODONCIA (ID: 2)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 2,
                'name' => 'Endodoncia Unirradicular',
                'requires_surface' => false,
                'default_cost' => 2200.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 2,
                'name' => 'Endodoncia Multirradicular',
                'requires_surface' => false,
                'default_cost' => 3500.00,
                'created_at' => now(), 'updated_at' => now()
            ],

            // ==========================================
            // CIRUGÍA ORAL Y MAXILOFACIAL (ID: 3)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 3,
                'name' => 'Extracción Dental Simple',
                'requires_surface' => false,
                'default_cost' => 900.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 3,
                'name' => 'Cirugía de Tercer Molar (Implicado/Retenido)',
                'requires_surface' => false,
                'default_cost' => 2800.00,
                'created_at' => now(), 'updated_at' => now()
            ],

            // ==========================================
            // PRÓTESIS Y REHABILITACIÓN ORAL (ID: 4)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 4,
                'name' => 'Corona de Zirconio',
                'requires_surface' => false,
                'default_cost' => 5200.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 4,
                'name' => 'Corona Metal-Porcelana',
                'requires_surface' => false,
                'default_cost' => 3800.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 4,
                'name' => 'Incrustación Estética (Inlay/Onlay)',
                'requires_surface' => true,
                'default_cost' => 2400.00,
                'created_at' => now(), 'updated_at' => now()
            ],

            // ==========================================
            // PERIODONCIA (ID: 5)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 5,
                'name' => 'Raspado y Alisado Radicular (Curetaje por Cuadrante)',
                'requires_surface' => false,
                'default_cost' => 1200.00,
                'created_at' => now(), 'updated_at' => now()
            ],

            // ==========================================
            // ORTODONCIA (ID: 6)
            // ==========================================
            [
                'type' => 'treatment',
                'treatment_category_id' => 6,
                'name' => 'Instalación de Brackets Metálicos (Ambas Arcadas)',
                'requires_surface' => false,
                'default_cost' => 8000.00,
                'created_at' => now(), 'updated_at' => now()
            ],
            [
                'type' => 'treatment',
                'treatment_category_id' => 6,
                'name' => 'Control Mensual de Ortodoncia',
                'requires_surface' => false,
                'default_cost' => 700.00,
                'created_at' => now(), 'updated_at' => now()
            ],
        ];

        DB::table('catalog_items')->insert($catalogItems);
    }
}