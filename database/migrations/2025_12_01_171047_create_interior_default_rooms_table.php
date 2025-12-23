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
        Schema::create('interior_default_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_template_id')->constrained('interior_room_templates')->cascadeOnDelete();
            $table->string('display_name');
            $table->unsignedInteger('sort_order')->default(0);
            $table->boolean('is_active')->default(true);
            $table->json('meta')->nullable();
            $table->timestamps();
            $table->unique(['room_template_id', 'display_name'], 'idr_template_name_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interior_default_rooms');
    }
};
