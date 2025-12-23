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
        Schema::create('interior_design_projects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('description')->nullable();
            $table->string('thumbnail')->nullable();
            $table->json('rooms'); // Array of room configurations
            $table->json('placements'); // Array of furniture placements
            $table->json('room_designs')->nullable(); // Room design settings (colors, etc.)
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interior_design_projects');
    }
};
