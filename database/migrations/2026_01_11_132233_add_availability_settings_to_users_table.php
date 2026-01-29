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
        Schema::table('users', function (Blueprint $table) {
            // Designer availability settings
            $table->time('work_start_time')->default('09:00')->after('is_available');
            $table->time('work_end_time')->default('18:00')->after('work_start_time');
            $table->integer('slot_duration')->default(60)->after('work_end_time'); // in minutes (30, 60, 90, 120)
            $table->json('working_days')->nullable()->after('slot_duration'); // [1,2,3,4,5] for Mon-Fri
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['work_start_time', 'work_end_time', 'slot_duration', 'working_days']);
        });
    }
};
