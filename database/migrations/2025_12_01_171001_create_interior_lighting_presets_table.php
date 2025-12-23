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
        Schema::create('interior_lighting_presets', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('temperature', 32)->nullable();
            $table->string('brightness', 32)->nullable();
            $table->string('tint', 32)->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->json('meta')->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interior_lighting_presets');
    }
};
