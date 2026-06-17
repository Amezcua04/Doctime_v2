<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('patient_contracts', function (Blueprint $table) {
            $table->foreignId('contract_template_id')->nullable()->constrained()->nullOnDelete();
            $table->boolean('is_generated')->default(false)->after('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('patient_contracts', function (Blueprint $table) {
            $table->dropForeign(['contract_template_id']);
            $table->dropColumn(['contract_template_id', 'is_generated']);
        });
    }
};
