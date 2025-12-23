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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('cartable_id');
            $table->string('cartable_type');
            $table->integer('quantity')->default(1);
            $table->timestamps();

            // Index for efficient lookups
            $table->index(['user_id', 'cartable_type', 'cartable_id']);
            
            // Unique constraint to prevent duplicates
            $table->unique(['user_id', 'cartable_id', 'cartable_type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
