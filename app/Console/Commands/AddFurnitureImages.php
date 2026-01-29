<?php

namespace App\Console\Commands;

use App\Models\Furniture;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;

class AddFurnitureImages extends Command
{
    protected $signature = 'furniture:add-images {--download : Download images to local storage}';
    protected $description = 'Add placeholder images to furniture items that have no image';

    // Placeholder images by category from Unsplash
    private array $imageUrls = [
        'Seating' => [
            'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', // Sofa
            'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&q=80', // Chair
            'https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=800&q=80', // Armchair
            'https://images.unsplash.com/photo-1581539250439-c96689b516dd?w=800&q=80', // Office chair
            'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=800&q=80', // Living room seating
        ],
        'Tables' => [
            'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=800&q=80', // Coffee table
            'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&q=80', // Dining table
            'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=800&q=80', // Side table
            'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=800&q=80', // Desk
        ],
        'Beds' => [
            'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&q=80', // Bed
            'https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?w=800&q=80', // Platform bed
            'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&q=80', // Bedroom
            'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&q=80', // Bedroom set
        ],
        'Storage' => [
            'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=800&q=80', // Wardrobe
            'https://images.unsplash.com/photo-1597072689227-8882273e8f6a?w=800&q=80', // Bookshelf
            'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=800&q=80', // Cabinet
            'https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?w=800&q=80', // TV unit
        ],
        'Lighting' => [
            'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80', // Chandelier
            'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80', // Pendant
            'https://images.unsplash.com/photo-1540932239986-30128078f3c5?w=800&q=80', // Floor lamp
            'https://images.unsplash.com/photo-1543198126-a8ad8e47fb22?w=800&q=80', // Table lamp
        ],
        'Decor' => [
            'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=800&q=80', // Mirror
            'https://images.unsplash.com/photo-1545165375-568e7a056077?w=800&q=80', // Plants
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', // Wall art
            'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80', // Rug
        ],
    ];

    public function handle()
    {
        $furniture = Furniture::whereNull('image')->orWhere('image', '')->get();
        
        if ($furniture->isEmpty()) {
            $this->info('All furniture items already have images!');
            return 0;
        }

        $this->info("Found {$furniture->count()} furniture items without images.");
        
        $categoryCounters = [];
        $downloadMode = $this->option('download');

        foreach ($furniture as $item) {
            $category = $item->category;
            $urls = $this->imageUrls[$category] ?? $this->imageUrls['Decor'];
            
            if (!isset($categoryCounters[$category])) {
                $categoryCounters[$category] = 0;
            }
            
            $imageIndex = $categoryCounters[$category] % count($urls);
            $imageUrl = $urls[$imageIndex];
            $categoryCounters[$category]++;

            if ($downloadMode) {
                // Download and store locally
                try {
                    $response = Http::timeout(30)->get($imageUrl);
                    if ($response->successful()) {
                        $filename = 'furniture/' . uniqid() . '.jpg';
                        Storage::disk('public')->put($filename, $response->body());
                        $item->image = $filename;
                        $item->save();
                        $this->info("✓ Downloaded image for: {$item->name}");
                    } else {
                        // Use URL directly as fallback
                        $item->image = $imageUrl;
                        $item->save();
                        $this->warn("⚠ Using URL for: {$item->name}");
                    }
                } catch (\Exception $e) {
                    $item->image = $imageUrl;
                    $item->save();
                    $this->warn("⚠ Using URL for: {$item->name} (download failed)");
                }
            } else {
                // Just use the URL directly
                $item->image = $imageUrl;
                $item->save();
                $this->info("✓ Added image URL for: {$item->name}");
            }
        }

        $this->newLine();
        $this->info('Done! Images have been added to furniture items.');
        return 0;
    }
}
