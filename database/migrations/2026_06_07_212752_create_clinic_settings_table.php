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
        Schema::create('clinic_settings', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Sunrise');
            $table->string('slogan')->nullable();
            $table->string('logo_path')->nullable();
            $table->string('favicon_path')->nullable();
            $table->string('phone')->nullable();
            $table->string('address')->nullable();
            $table->string('hero_title')->default('Titulo');
            $table->text('hero_description')->nullable();
            $table->boolean('enable_email_reminders')->default(true);
            $table->boolean('enable_whatsapp_reminders')->default(false);
            $table->integer('reminder_hours_before')->default(48);
            $table->string('whatsapp_phone_id')->nullable();
            $table->text('whatsapp_api_token')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clinic_settings');
    }
};
