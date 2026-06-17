<?php

namespace Database\Seeders;

use App\Models\ClinicSetting;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ClinicSettingSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        ClinicSetting::create([
            'name' => 'Sunrise',
            'address' => 'Roma 151, Cd del Valle, 63157 Tepic, Nay.',
            'hero_description' => 'Clínica dental de especialidades.',
        ]);
    }
}
