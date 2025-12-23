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
        Schema::create('materials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category'); // Construction, Flooring, Wall Finish, Color Palette
            $table->string('type'); // Structural, Ceramic, Paint, Stone, etc.
            $table->decimal('price_per_unit', 12, 2)->default(0);
            $table->string('unit')->default('piece'); // piece, sq.ft, cu.m, liter, bag
            $table->string('image')->nullable();
            $table->string('color')->nullable(); // Hex color code
            $table->string('brand')->nullable();
            $table->text('specifications')->nullable();
            $table->string('availability')->default('In Stock');
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('materials');
    }
};
