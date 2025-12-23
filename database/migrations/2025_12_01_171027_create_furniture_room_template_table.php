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
        Schema::create('furniture_room_template', function (Blueprint $table) {
            $table->id();
            $table->foreignId('furniture_item_id')->constrained('interior_furniture_items')->cascadeOnDelete();
            $table->foreignId('room_template_id')->constrained('interior_room_templates')->cascadeOnDelete();
            $table->boolean('is_primary')->default(false);
            $table->string('note')->nullable();
            $table->timestamps();
            $table->unique(['furniture_item_id', 'room_template_id'], 'frt_furniture_room_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('furniture_room_template');
    }
};
