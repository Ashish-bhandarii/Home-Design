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
        Schema::create('interior_furniture_items', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('category')->index();
            $table->string('style')->nullable();
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->decimal('height', 8, 2)->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->json('suitable_for')->nullable();
            $table->string('primary_color', 32)->nullable();
            $table->string('finish')->nullable();
            $table->string('thumbnail_path')->nullable();
            $table->string('model_path')->nullable();
            $table->boolean('is_active')->default(true)->index();
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
        Schema::dropIfExists('interior_furniture_items');
    }
};
