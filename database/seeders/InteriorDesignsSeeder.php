<?php

namespace Database\Seeders;

use App\Models\InteriorDesign;
use Illuminate\Database\Seeder;

class InteriorDesignsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $samples = [];

        for ($i = 1; $i <= 12; $i++) {
            $samples[] = [
                'name' => "Sample Interior Design #{$i}",
                'description' => "A sample interior design entry number {$i} for testing and demo.",
                'room_type' => array_rand(InteriorDesign::roomTypeOptions()),
                'style' => array_rand(InteriorDesign::styleOptions()),
                'room_width' => 3 + ($i * 0.2),
                'room_length' => 4 + ($i * 0.2),
                'room_height' => 2.8,
                'area_sqft' => (string) (12 + $i * 2),
                'color_scheme' => 'neutral',
                'primary_material' => array_rand(InteriorDesign::primaryMaterialOptions()),
                'flooring_type' => array_rand(InteriorDesign::flooringTypeOptions()),
                'ceiling_type' => array_rand(InteriorDesign::ceilingTypeOptions()),
                'lighting_type' => array_rand(InteriorDesign::lightingTypeOptions()),
                'estimated_cost_min' => 50000 + ($i * 10000),
                'estimated_cost_max' => 100000 + ($i * 15000),
                'cover_image' => 'interior-designs/covers/' . (['3i0HnKaoAJ9XP4eWf6BurqwmkO0XOrFKlYOLwYvc.jpg', 'F48Ot9ZbxQQlorWt3b1QDekTXG6SDTPPlvIp1nIK.jpg', 'gjDewm136YTYmWzHY67l9GgsMnk2r3H7nvW3hVsb.jpg', 'H4vKysT2munBkmsf34yGNhg9WzT5aazJh0OrRRY3.jpg', 'HrN2AlkEM707xVfxjmpX0Bqadot82X6PWshDEdmY.jpg', 'jV8hUHc9unO2knrcS8oEViAKa6CgXbJ2McN22lw7.jpg', 'otE11nnmft0HDtU4yJLhXk0CfAukvGME4dQiywQj.jpg', 'PmKfPciX6GaFNOPNXh3zFr1ze58jxutewQaU44VU.jpg', 'tmw1oozUccrTWW8kIYiXMtSu5Md5GrSR5uoRlK04.jpg', 'UiUEq486g4zDHo6UEnUEuPY4KQUNYitEstOhRpAh.jpg', 'WRJXISvaG2Mib1ipm5cicWy3KoBG2NTIdLgfuA8H.jpg', 'XgTNJxgLn46kUxwKdyVbKFpi3VSjcLbI7Gc3cXiG.jpg', 'XXQBFll7icvzGHcPM8Q4EFLEVG9JZJjRzvekJ1Dd.jpg'][($i-1) % 13]),
                'furniture_items' => [],
                'color_palette' => [],
                'features' => ['cozy', 'functional'],
                'tags' => ['demo', 'seeded'],
                'is_featured' => $i % 3 === 0,
                'is_active' => true,
                'views' => rand(0, 300),
                'downloads' => rand(0, 20),
                'created_at' => now()->subDays(12 - $i),
                'updated_at' => now()->subDays(12 - $i),
            ];
        }

        foreach ($samples as $s) {
            $design = InteriorDesign::where('name', $s['name'])->first();
            if ($design) {
                $design->update(['cover_image' => $s['cover_image']]);
            } else {
                InteriorDesign::create($s);
            }
        }
    }
}
