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
        Schema::create('interior_room_templates', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->string('name');
            $table->decimal('width', 8, 2)->nullable();
            $table->decimal('length', 8, 2)->nullable();
            $table->integer('level')->default(0);
            $table->text('description')->nullable();
            $table->json('tags')->nullable();
            $table->foreignId('default_material_id')->nullable()->constrained('interior_materials');
            $table->foreignId('default_lighting_id')->nullable()->constrained('interior_lighting_presets');
            $table->boolean('is_active')->default(true);
            $table->json('meta')->nullable();
            $table->softDeletes();
            $table->timestamps();
            $table->index(['level', 'is_active']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interior_room_templates');
    }
};
