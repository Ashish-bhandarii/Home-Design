<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

class InteriorCatalogSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Schema::disableForeignKeyConstraints();

        DB::table('material_room_template')->truncate();
        DB::table('furniture_room_template')->truncate();
        DB::table('interior_default_rooms')->truncate();
        DB::table('interior_inspirations')->truncate();
        DB::table('interior_room_templates')->truncate();
        DB::table('interior_furniture_items')->truncate();
        DB::table('interior_lighting_presets')->truncate();
        DB::table('interior_materials')->truncate();

        Schema::enableForeignKeyConstraints();

        $now = now();

        $materials = [
            'earthy-lounge' => [
                'name' => 'Earthy Lounge',
                'floor' => '#b38358',
                'wall' => '#f6efe2',
                'accent' => '#d97757',
                'lighting' => '#facc15',
                'description' => 'Walnut plank flooring with ivory stucco walls and copper accents.',
                'mood' => 'warm',
                'applies_to' => ['living', 'dining', 'study'],
            ],
            'midnight-minimal' => [
                'name' => 'Midnight Minimal',
                'floor' => '#1f2933',
                'wall' => '#e5e7eb',
                'accent' => '#64748b',
                'lighting' => '#38bdf8',
                'description' => 'Charcoal slate tiles, soft white walls, and brushed steel hardware.',
                'mood' => 'cool',
                'applies_to' => ['living', 'study', 'kitchen', 'any'],
            ],
            'spa-retreat' => [
                'name' => 'Spa Retreat',
                'floor' => '#a7c7a1',
                'wall' => '#f8faf5',
                'accent' => '#6b8f71',
                'lighting' => '#f8d477',
                'description' => 'Matte sage stone, limewash walls, and brushed brass fittings.',
                'mood' => 'neutral',
                'applies_to' => ['bathroom', 'bedroom'],
            ],
            'artisan-kitchen' => [
                'name' => 'Artisan Kitchen',
                'floor' => '#d6a15d',
                'wall' => '#fdf3ea',
                'accent' => '#b45309',
                'lighting' => '#fbbf24',
                'description' => 'Terracotta chevron floors with plaster finish and teak cabinetry.',
                'mood' => 'warm',
                'applies_to' => ['kitchen', 'dining'],
            ],
            'nebula-suite' => [
                'name' => 'Nebula Suite',
                'floor' => '#4c51bf',
                'wall' => '#eef2ff',
                'accent' => '#a855f7',
                'lighting' => '#c084fc',
                'description' => 'Midnight indigo carpet with lavender accents and soft diffused lighting.',
                'mood' => 'cool',
                'applies_to' => ['bedroom', 'study'],
            ],
            'gallery-white' => [
                'name' => 'Gallery White',
                'floor' => '#d1d5db',
                'wall' => '#ffffff',
                'accent' => '#111827',
                'lighting' => '#e5e7eb',
                'description' => 'Polished concrete floor, gallery-white walls, and matte black hardware.',
                'mood' => 'neutral',
                'applies_to' => ['any'],
            ],
        ];

        $materialIds = [];
        foreach ($materials as $slug => $material) {
            $materialIds[$slug] = DB::table('interior_materials')->insertGetId([
                'ulid' => (string) Str::ulid(),
                'slug' => $slug,
                'name' => $material['name'],
                'floor_color' => $material['floor'],
                'wall_color' => $material['wall'],
                'accent_color' => $material['accent'],
                'lighting_color' => $material['lighting'],
                'mood' => $material['mood'],
                'description' => $material['description'],
                'applies_to' => json_encode($material['applies_to']),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $lightingPresets = [
            'golden-hour' => [
                'name' => 'Golden Hour',
                'temperature' => '3000K',
                'brightness' => '70%',
                'tint' => '#fbbf24',
                'description' => 'Warm ambient wash paired with soft uplights for hospitality spaces.',
            ],
            'studio-daylight' => [
                'name' => 'Studio Daylight',
                'temperature' => '5000K',
                'brightness' => '85%',
                'tint' => '#60a5fa',
                'description' => 'High CRI daylight for kitchens, creative studios, and product shoots.',
            ],
            'twilight' => [
                'name' => 'Twilight Glow',
                'temperature' => '2700K',
                'brightness' => '55%',
                'tint' => '#fda4af',
                'description' => 'Layered sconces and concealed coves tuned for relaxed evening rituals.',
            ],
            'gallery-track' => [
                'name' => 'Gallery Track',
                'temperature' => '4000K',
                'brightness' => '65%',
                'tint' => '#a6e3e9',
                'description' => 'Directional beams with accent dimmers to highlight curated vignettes.',
            ],
        ];

        $lightingIds = [];
        foreach ($lightingPresets as $slug => $preset) {
            $lightingIds[$slug] = DB::table('interior_lighting_presets')->insertGetId([
                'ulid' => (string) Str::ulid(),
                'slug' => $slug,
                'name' => $preset['name'],
                'temperature' => $preset['temperature'],
                'brightness' => $preset['brightness'],
                'tint' => $preset['tint'],
                'description' => $preset['description'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $furnitureItems = [
            'sofa-modular-01' => [
                'name' => 'Modular Nova Sofa',
                'category' => 'Seating',
                'style' => 'Contemporary',
                'width' => 10,
                'length' => 4,
                'height' => 2.8,
                'price' => 185000,
                'suitable_for' => ['living', 'study'],
                'color' => '#f5ebe1',
                'finish' => 'Bouclé upholstery with oak plinth base',
            ],
            'dining-table-02' => [
                'name' => 'Sikkim Carved Dining',
                'category' => 'Tables',
                'style' => 'Craft Revival',
                'width' => 8,
                'length' => 4,
                'height' => 2.6,
                'price' => 98000,
                'suitable_for' => ['dining', 'living'],
                'color' => '#8b5e34',
                'finish' => 'Hand-carved walnut with brass inlay',
            ],
            'accent-chair-01' => [
                'name' => 'Kathmandu Lounge Chair',
                'category' => 'Seating',
                'style' => 'Mid-century',
                'width' => 3,
                'length' => 3,
                'height' => 3,
                'price' => 32000,
                'suitable_for' => ['living', 'study', 'bedroom'],
                'color' => '#bf7944',
                'finish' => 'Saddle leather with teak frame',
            ],
            'bed-frame-01' => [
                'name' => 'Floating Canopy Bed',
                'category' => 'Beds',
                'style' => 'Boutique Hotel',
                'width' => 6.5,
                'length' => 7.5,
                'height' => 4.5,
                'price' => 145000,
                'suitable_for' => ['bedroom'],
                'color' => '#ece7df',
                'finish' => 'Upholstered headboard with smoked-oak canopy',
            ],
            'wardrobe-01' => [
                'name' => 'Rattan Wardrobe System',
                'category' => 'Storage',
                'style' => 'Tropical Modern',
                'width' => 8,
                'length' => 2.5,
                'height' => 8,
                'price' => 112000,
                'suitable_for' => ['bedroom', 'study'],
                'color' => '#e3caa5',
                'finish' => 'Cane fronts with matte brass pulls',
            ],
            'kitchen-island-01' => [
                'name' => 'Quartz Waterfall Island',
                'category' => 'Casework',
                'style' => 'Minimal Luxe',
                'width' => 8,
                'length' => 3,
                'height' => 3,
                'price' => 165000,
                'suitable_for' => ['kitchen'],
                'color' => '#f3f4f6',
                'finish' => 'Honest quartz slab with brushed chrome detail',
            ],
            'desk-creative-01' => [
                'name' => 'Creative Ridge Desk',
                'category' => 'Tables',
                'style' => 'Scandinavian',
                'width' => 5,
                'length' => 2.5,
                'height' => 2.5,
                'price' => 42000,
                'suitable_for' => ['study', 'living', 'any'],
                'color' => '#f8f4ec',
                'finish' => 'Ash veneer with matte lacquer legs',
            ],
            'bath-vanity-01' => [
                'name' => 'Stone Basin Vanity',
                'category' => 'Casework',
                'style' => 'Spa',
                'width' => 4.5,
                'length' => 2,
                'height' => 3,
                'price' => 76000,
                'suitable_for' => ['bathroom'],
                'color' => '#cbd5d5',
                'finish' => 'Honest quartzite slab with integrated basin',
            ],
        ];

        $furnitureIds = [];
        foreach ($furnitureItems as $slug => $item) {
            $furnitureIds[$slug] = DB::table('interior_furniture_items')->insertGetId([
                'ulid' => (string) Str::ulid(),
                'slug' => $slug,
                'name' => $item['name'],
                'category' => $item['category'],
                'style' => $item['style'],
                'width' => $item['width'],
                'length' => $item['length'],
                'height' => $item['height'],
                'price' => $item['price'],
                'suitable_for' => json_encode($item['suitable_for']),
                'primary_color' => $item['color'],
                'finish' => $item['finish'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $roomTemplates = [
            'living' => [
                'name' => 'Living Lounge',
                'width' => 18,
                'length' => 16,
                'level' => 0,
                'description' => 'Anchored living space with terrace connection and media wall.',
                'tags' => ['hosting', 'entertainment'],
                'default_material' => 'earthy-lounge',
                'default_lighting' => 'golden-hour',
            ],
            'kitchen' => [
                'name' => 'Chefs Kitchen',
                'width' => 14,
                'length' => 12,
                'level' => 0,
                'description' => 'Back-of-house prep with visual openness to dining.',
                'tags' => ['culinary', 'prep'],
                'default_material' => 'artisan-kitchen',
                'default_lighting' => 'studio-daylight',
            ],
            'dining' => [
                'name' => 'Dining Gallery',
                'width' => 12,
                'length' => 12,
                'level' => 0,
                'description' => 'Seating for 8 with direct connection to courtyard.',
                'tags' => ['hosting', 'dining'],
                'default_material' => 'earthy-lounge',
                'default_lighting' => 'gallery-track',
            ],
            'bedroom' => [
                'name' => 'Skyline Suite',
                'width' => 16,
                'length' => 15,
                'level' => 1,
                'description' => 'Primary suite with walk-in wardrobe and balcony edge.',
                'tags' => ['rest', 'luxe'],
                'default_material' => 'nebula-suite',
                'default_lighting' => 'twilight',
            ],
            'bathroom' => [
                'name' => 'Wellness Bath',
                'width' => 10,
                'length' => 9,
                'level' => 1,
                'description' => 'Double vanity, walk-in shower, and soaking tub niche.',
                'tags' => ['spa', 'ritual'],
                'default_material' => 'spa-retreat',
                'default_lighting' => 'golden-hour',
            ],
            'study' => [
                'name' => 'Creative Studio',
                'width' => 12,
                'length' => 10,
                'level' => 1,
                'description' => 'Flexible focus lounge with built-in library wall.',
                'tags' => ['work', 'creative'],
                'default_material' => 'midnight-minimal',
                'default_lighting' => 'studio-daylight',
            ],
        ];

        $roomTemplateIds = [];
        foreach ($roomTemplates as $slug => $template) {
            $roomTemplateIds[$slug] = DB::table('interior_room_templates')->insertGetId([
                'ulid' => (string) Str::ulid(),
                'slug' => $slug,
                'name' => $template['name'],
                'width' => $template['width'],
                'length' => $template['length'],
                'level' => $template['level'],
                'description' => $template['description'],
                'tags' => json_encode($template['tags']),
                'default_material_id' => $materialIds[$template['default_material']] ?? null,
                'default_lighting_id' => $lightingIds[$template['default_lighting']] ?? null,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        foreach ($materials as $slug => $material) {
            $materialId = $materialIds[$slug];
            $targets = $material['applies_to'] ?? [];
            $targetSlugs = in_array('any', $targets, true) ? array_keys($roomTemplateIds) : $targets;
            foreach ($targetSlugs as $targetSlug) {
                if (! isset($roomTemplateIds[$targetSlug])) {
                    continue;
                }

                DB::table('material_room_template')->insert([
                    'material_id' => $materialId,
                    'room_template_id' => $roomTemplateIds[$targetSlug],
                    'is_default' => ($roomTemplates[$targetSlug]['default_material'] ?? null) === $slug,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        foreach ($furnitureItems as $slug => $item) {
            $furnitureId = $furnitureIds[$slug];
            $targets = $item['suitable_for'] ?? [];
            $targetSlugs = in_array('any', $targets, true) ? array_keys($roomTemplateIds) : $targets;
            foreach ($targetSlugs as $targetSlug) {
                if (! isset($roomTemplateIds[$targetSlug])) {
                    continue;
                }

                DB::table('furniture_room_template')->insert([
                    'furniture_item_id' => $furnitureId,
                    'room_template_id' => $roomTemplateIds[$targetSlug],
                    'is_primary' => false,
                    'note' => null,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }

        $inspirations = [
            'terracotta-atrium' => [
                'label' => 'Terracotta Atrium',
                'category' => 'inspiration',
                'swatch' => '#c86b3c',
                'note' => 'Double-height atrium with diffused skylight and terracotta render.',
            ],
            'brutalist-calm' => [
                'label' => 'Brutalist Calm',
                'category' => 'inspiration',
                'swatch' => '#4b5563',
                'note' => 'Board-formed concrete softened with linen drapery and foliage.',
            ],
            'himalayan-dawn' => [
                'label' => 'Himalayan Dawn',
                'category' => 'inspiration',
                'swatch' => '#f9a8d4',
                'note' => 'Rose quartz palette with woven wool textures and copper highlights.',
            ],
        ];

        foreach ($inspirations as $slug => $inspiration) {
            DB::table('interior_inspirations')->insert([
                'ulid' => (string) Str::ulid(),
                'slug' => $slug,
                'label' => $inspiration['label'],
                'category' => $inspiration['category'],
                'swatch' => $inspiration['swatch'],
                'note' => $inspiration['note'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $defaultRooms = [
            ['template' => 'living', 'name' => 'Great Room', 'order' => 1],
            ['template' => 'kitchen', 'name' => 'Show Kitchen', 'order' => 2],
            ['template' => 'dining', 'name' => 'Dining Nook', 'order' => 3],
            ['template' => 'bedroom', 'name' => 'Primary Suite', 'order' => 4],
            ['template' => 'bathroom', 'name' => 'Ensuite Bath', 'order' => 5],
            ['template' => 'study', 'name' => 'Creative Studio', 'order' => 6],
        ];

        foreach ($defaultRooms as $entry) {
            if (! isset($roomTemplateIds[$entry['template']])) {
                continue;
            }

            DB::table('interior_default_rooms')->insert([
                'room_template_id' => $roomTemplateIds[$entry['template']],
                'display_name' => $entry['name'],
                'sort_order' => $entry['order'],
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }
    }
}
