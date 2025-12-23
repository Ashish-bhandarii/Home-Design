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
        Schema::table('furniture', function (Blueprint $table) {
            $table->string('availability')->default('In Stock')->after('stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('furniture', function (Blueprint $table) {
            $table->dropColumn('availability');
        });
    }
};
