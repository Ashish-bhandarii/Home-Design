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
        Schema::create('interior_materials', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('floor_color', 32);
            $table->string('wall_color', 32);
            $table->string('accent_color', 32);
            $table->string('lighting_color', 32)->nullable();
            $table->enum('mood', ['warm', 'cool', 'neutral']);
            $table->text('description')->nullable();
            $table->json('applies_to')->nullable();
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
        Schema::dropIfExists('interior_materials');
    }
};
