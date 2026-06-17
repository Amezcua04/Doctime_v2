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
        Schema::create('odontogram_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('odontogram_id')->constrained()->cascadeOnDelete();
            $table->foreignId('catalog_item_id')->constrained('catalog_items');
            $table->unsignedTinyInteger('tooth_number');
            $table->string('surface', 20)->nullable();
            $table->enum('status', ['preexistent', 'planned', 'completed']);
            $table->decimal('cost', 10, 2)->default(0);
            $table->text('observations')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('odontogram_items');
    }
};
