<?php

namespace Database\Seeders;

use App\Models\HomeDesign;
use Illuminate\Database\Seeder;

class HomeDesignsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $samples = [];

        for ($i = 1; $i <= 12; $i++) {
            $samples[] = [
                'name' => "Sample Home Design #{$i}",
                'description' => "A sample home design entry number {$i} for testing and demo.",
                'style' => array_rand(HomeDesign::styleOptions()),
                'total_floors' => rand(1, 3),
                'total_area_sqft' => (string) (1000 + $i * 150),
                'plot_width' => 10 + $i,
                'plot_length' => 12 + $i,
                'bedrooms' => rand(1, 5),
                'bathrooms' => rand(1, 3),
                'kitchens' => 1,
                'living_rooms' => 1,
                'dining_rooms' => 1,
                'balconies' => rand(0,2),
                'garages' => rand(0,1),
                'has_basement' => false,
                'has_terrace' => (bool) rand(0,1),
                'has_garden' => (bool) rand(0,1),
                'has_swimming_pool' => false,
                'construction_type' => array_rand(HomeDesign::constructionTypeOptions()),
                'facing_direction' => array_rand(HomeDesign::facingDirectionOptions()),
                'estimated_cost_min' => 1500000 + ($i * 100000),
                'estimated_cost_max' => 2000000 + ($i * 150000),
                'cover_image' => 'home-designs/covers/' . (['0Kmhb1FqwAmcPWBhdb8YApKNIrg5hQGeKlLg3zVt.jpg', '6H51xaoh2EXcMz2fg49Z5NjlJKrNTfi9r9hUcDV9.jpg', 'SzQWMJPnHr3cf6jOhIOsUI7uk5NoNbHEdswRtgpg.jpg'][($i-1) % 3]),
                'features' => ['open-plan', 'natural-light'],
                'tags' => ['demo', 'seeded'],
                'is_featured' => $i % 4 === 0,
                'is_active' => true,
                'views' => rand(0, 500),
                'downloads' => rand(0, 50),
                'created_at' => now()->subDays(12 - $i),
                'updated_at' => now()->subDays(12 - $i),
            ];
        }

        foreach ($samples as $s) {
            $design = HomeDesign::where('name', $s['name'])->first();
            if ($design) {
                $design->update(['cover_image' => $s['cover_image']]);
            } else {
                HomeDesign::create($s);
            }
        }
    }
}
