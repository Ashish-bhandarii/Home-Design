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
        Schema::create('admin_notifications', function (Blueprint $table) {
            $table->id();
            $table->string('type'); // order, user, design, system
            $table->string('title');
            $table->text('message');
            $table->string('icon')->nullable(); // Icon name
            $table->string('color')->default('blue'); // Color theme
            $table->string('link')->nullable(); // Link to relevant page
            $table->json('data')->nullable(); // Additional data
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('admin_notifications');
    }
};
