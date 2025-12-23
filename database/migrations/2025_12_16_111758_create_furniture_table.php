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
        Schema::create('furniture', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->string('category'); // Seating, Tables, Beds, Storage, Lighting, Decor
            $table->string('room'); // Living Room, Bedroom, Dining Room, Kitchen, Office, Bathroom
            $table->decimal('price', 12, 2)->default(0);
            $table->string('image')->nullable();
            $table->json('dimensions')->nullable(); // {width, height, depth}
            $table->string('material')->nullable(); // Wood, Metal, Fabric, etc.
            $table->string('color')->nullable();
            $table->integer('stock')->default(0);
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
        Schema::dropIfExists('furniture');
    }
};
