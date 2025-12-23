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
        // Home Designs - Complete house/building designs
        Schema::create('home_designs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('style')->nullable(); // Modern, Traditional, Contemporary, etc.
            $table->integer('total_floors')->default(1);
            $table->decimal('total_area_sqft', 10, 2)->nullable();
            $table->decimal('plot_width', 10, 2)->nullable(); // in feet
            $table->decimal('plot_length', 10, 2)->nullable(); // in feet
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('kitchens')->default(1);
            $table->integer('living_rooms')->default(1);
            $table->integer('dining_rooms')->default(0);
            $table->integer('balconies')->default(0);
            $table->integer('garages')->default(0);
            $table->boolean('has_basement')->default(false);
            $table->boolean('has_terrace')->default(false);
            $table->boolean('has_garden')->default(false);
            $table->boolean('has_swimming_pool')->default(false);
            $table->string('construction_type')->nullable(); // RCC, Load Bearing, Steel Frame
            $table->string('facing_direction')->nullable(); // North, South, East, West
            $table->decimal('estimated_cost_min', 15, 2)->nullable();
            $table->decimal('estimated_cost_max', 15, 2)->nullable();
            $table->string('cover_image')->nullable();
            $table->json('features')->nullable(); // Additional features array
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('views')->default(0);
            $table->integer('downloads')->default(0);
            $table->timestamps();
        });

        // Floor Designs - Individual floor plans (can be standalone or part of home)
        Schema::create('floor_designs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_design_id')->nullable()->constrained('home_designs')->onDelete('cascade');
            $table->string('name');
            $table->text('description')->nullable();
            $table->integer('floor_number')->default(0); // 0 = Ground, 1 = First, -1 = Basement
            $table->decimal('width', 10, 2)->nullable(); // in feet
            $table->decimal('length', 10, 2)->nullable(); // in feet
            $table->decimal('floor_area_sqft', 10, 2)->nullable();
            $table->decimal('carpet_area_sqft', 10, 2)->nullable();
            $table->integer('bedrooms')->default(0);
            $table->integer('bathrooms')->default(0);
            $table->integer('kitchens')->default(0);
            $table->integer('living_rooms')->default(0);
            $table->integer('dining_rooms')->default(0);
            $table->integer('balconies')->default(0);
            $table->boolean('has_stairs')->default(false);
            $table->boolean('has_lift')->default(false);
            $table->boolean('has_puja_room')->default(false);
            $table->boolean('has_store_room')->default(false);
            $table->boolean('has_servant_room')->default(false);
            $table->string('cover_image')->nullable();
            $table->json('features')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });

        // Interior Designs - Room/space interior designs
        Schema::create('interior_designs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('room_type'); // Living Room, Bedroom, Kitchen, Bathroom, Office, etc.
            $table->string('style')->nullable(); // Modern, Classic, Minimalist, Industrial, etc.
            $table->decimal('room_width', 10, 2)->nullable();
            $table->decimal('room_length', 10, 2)->nullable();
            $table->decimal('room_height', 10, 2)->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->string('color_scheme')->nullable();
            $table->string('primary_material')->nullable(); // Wood, Metal, Glass, etc.
            $table->string('flooring_type')->nullable(); // Tiles, Wood, Marble, Carpet
            $table->string('ceiling_type')->nullable(); // False Ceiling, POP, Plain
            $table->string('lighting_type')->nullable(); // Ambient, Task, Accent
            $table->decimal('estimated_cost_min', 15, 2)->nullable();
            $table->decimal('estimated_cost_max', 15, 2)->nullable();
            $table->string('cover_image')->nullable();
            $table->json('furniture_items')->nullable(); // List of furniture
            $table->json('color_palette')->nullable(); // Color codes
            $table->json('features')->nullable();
            $table->json('tags')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('views')->default(0);
            $table->integer('downloads')->default(0);
            $table->timestamps();
        });

        // Rooms - Detailed room specifications for floor plans
        Schema::create('rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('floor_design_id')->constrained('floor_designs')->onDelete('cascade');
            $table->string('room_type'); // Bedroom, Bathroom, Kitchen, etc.
            $table->string('name')->nullable(); // Master Bedroom, Guest Room, etc.
            $table->decimal('length', 10, 2)->nullable();
            $table->decimal('width', 10, 2)->nullable();
            $table->decimal('area_sqft', 10, 2)->nullable();
            $table->boolean('has_attached_bathroom')->default(false);
            $table->boolean('has_balcony')->default(false);
            $table->boolean('has_wardrobe')->default(false);
            $table->integer('windows_count')->default(0);
            $table->integer('doors_count')->default(1);
            $table->string('ventilation')->nullable(); // Good, Average, Poor
            $table->string('facing_direction')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Design Files - Store various file types for designs
        Schema::create('design_files', function (Blueprint $table) {
            $table->id();
            $table->morphs('designable'); // For polymorphic relation (home_designs, floor_designs, interior_designs)
            $table->string('file_type'); // 2d_plan, 3d_render, 3d_model, video, cad, pdf
            $table->string('title')->nullable();
            $table->string('file_path');
            $table->string('file_extension')->nullable();
            $table->integer('file_size')->nullable(); // in bytes
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });

        // Design Images - Gallery images for designs
        Schema::create('design_images', function (Blueprint $table) {
            $table->id();
            $table->morphs('imageable');
            $table->string('image_path');
            $table->string('caption')->nullable();
            $table->boolean('is_cover')->default(false);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('design_images');
        Schema::dropIfExists('design_files');
        Schema::dropIfExists('rooms');
        Schema::dropIfExists('interior_designs');
        Schema::dropIfExists('floor_designs');
        Schema::dropIfExists('home_designs');
    }
};
