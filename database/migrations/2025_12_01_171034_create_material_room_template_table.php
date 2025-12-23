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
        Schema::create('material_room_template', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('interior_materials')->cascadeOnDelete();
            $table->foreignId('room_template_id')->constrained('interior_room_templates')->cascadeOnDelete();
            $table->boolean('is_default')->default(false);
            $table->timestamps();
            $table->unique(['material_id', 'room_template_id'], 'mrt_material_room_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('material_room_template');
    }
};
