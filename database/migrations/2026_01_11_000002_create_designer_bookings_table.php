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
        // Add designer-specific fields to users table (only if they don't exist)
        Schema::table('users', function (Blueprint $table) {
            if (!Schema::hasColumn('users', 'specialty')) {
                $table->string('specialty')->nullable()->after('role'); // e.g., Interior Design, Architecture, Landscape
            }
            if (!Schema::hasColumn('users', 'bio')) {
                $table->text('bio')->nullable()->after('specialty');
            }
            if (!Schema::hasColumn('users', 'hourly_rate')) {
                $table->decimal('hourly_rate', 10, 2)->nullable()->after('bio');
            }
            if (!Schema::hasColumn('users', 'experience_years')) {
                $table->integer('experience_years')->nullable()->after('hourly_rate');
            }
            if (!Schema::hasColumn('users', 'portfolio_url')) {
                $table->string('portfolio_url')->nullable()->after('experience_years');
            }
            // avatar column likely already exists
            if (!Schema::hasColumn('users', 'avatar')) {
                $table->string('avatar')->nullable()->after('portfolio_url');
            }
            if (!Schema::hasColumn('users', 'is_available')) {
                $table->boolean('is_available')->default(true)->after('avatar');
            }
        });

        // Create designer bookings table
        Schema::create('designer_bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // The user booking
            $table->foreignId('designer_id')->constrained('users')->onDelete('cascade'); // The designer
            $table->date('booking_date');
            $table->time('booking_time');
            $table->integer('duration_minutes')->default(60); // Consultation duration
            $table->string('consultation_type'); // online, in-person
            $table->string('status')->default('pending'); // pending, confirmed, completed, cancelled
            $table->string('project_type')->nullable(); // Interior Design, Floor Plan, etc.
            $table->text('description')->nullable(); // User's project description
            $table->text('notes')->nullable(); // Designer's notes
            $table->string('meeting_link')->nullable(); // For online consultations
            $table->decimal('price', 10, 2)->nullable();
            $table->timestamps();
            
            // Prevent double booking
            $table->unique(['designer_id', 'booking_date', 'booking_time'], 'unique_designer_slot');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('designer_bookings');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'specialty',
                'bio',
                'hourly_rate',
                'experience_years',
                'portfolio_url',
                'avatar',
                'is_available',
            ]);
        });
    }
};
