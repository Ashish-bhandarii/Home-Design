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
        Schema::create('interior_inspirations', function (Blueprint $table) {
            $table->id();
            $table->ulid('ulid')->unique();
            $table->string('slug')->unique();
            $table->string('label');
            $table->string('category');
            $table->string('swatch', 32)->nullable();
            $table->text('note')->nullable();
            $table->string('asset_path')->nullable();
            $table->string('source_url')->nullable();
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
        Schema::dropIfExists('interior_inspirations');
    }
};
