<?php

namespace Database\Seeders;

use App\Models\HomeDesign;
use App\Models\DesignFile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;

class DesignFilesSeeder extends Seeder
{
    /**
     * Seed design files for testing the download feature.
     *
     * Run with: php artisan db:seed --class=DesignFilesSeeder
     */
    public function run(): void
    {
        // Get the first home design (or a specific one)
        $homeDesign = HomeDesign::first();

        if (!$homeDesign) {
            $this->command->error('No home designs found. Please create a home design first.');
            return;
        }

        $this->command->info("Adding sample files to: {$homeDesign->name}");

        // Sample files to add (you'll need to create these files in storage/app/public/sample-files/)
        $sampleFiles = [
            [
                'file_type' => '2d_plan',
                'title' => 'Ground Floor Plan',
                'file_path' => 'sample-files/ground-floor-plan.pdf',
                'file_extension' => 'pdf',
                'file_size' => 1024000, // 1MB
                'sort_order' => 1,
            ],
            [
                'file_type' => '2d_plan',
                'title' => 'First Floor Plan',
                'file_path' => 'sample-files/first-floor-plan.pdf',
                'file_extension' => 'pdf',
                'file_size' => 950000,
                'sort_order' => 2,
            ],
            [
                'file_type' => '3d_render',
                'title' => 'Exterior View',
                'file_path' => 'sample-files/exterior-render.jpg',
                'file_extension' => 'jpg',
                'file_size' => 2048000, // 2MB
                'sort_order' => 3,
            ],
            [
                'file_type' => 'cad',
                'title' => 'Complete CAD Drawing',
                'file_path' => 'sample-files/complete-design.dwg',
                'file_extension' => 'dwg',
                'file_size' => 3072000, // 3MB
                'sort_order' => 4,
            ],
            [
                'file_type' => 'pdf',
                'title' => 'Design Specifications',
                'file_path' => 'sample-files/specifications.pdf',
                'file_extension' => 'pdf',
                'file_size' => 512000, // 512KB
                'sort_order' => 5,
            ],
        ];

        // Create the sample files directory if it doesn't exist
        $sampleDir = storage_path('app/public/sample-files');
        if (!file_exists($sampleDir)) {
            mkdir($sampleDir, 0755, true);
            $this->command->info("Created directory: {$sampleDir}");
        }

        $created = 0;
        foreach ($sampleFiles as $fileData) {
            // Create dummy files if they don't exist (for testing purposes)
            $fullPath = storage_path('app/public/' . $fileData['file_path']);
            if (!file_exists($fullPath)) {
                $this->createDummyFile($fullPath, $fileData['file_extension']);
                $this->command->info("Created dummy file: {$fileData['file_path']}");
            }

            // Create the design file record
            $designFile = $homeDesign->files()->create($fileData);
            $created++;

            $this->command->info("Added: {$designFile->title} ({$designFile->file_type_label})");
        }

        $this->command->info("\n✓ Successfully added {$created} files to '{$homeDesign->name}'");
        $this->command->info("You can now test the download feature at: /design-home/{$homeDesign->id}");
    }

    /**
     * Create a dummy file for testing purposes.
     */
    private function createDummyFile(string $path, string $extension): void
    {
        $dir = dirname($path);
        if (!file_exists($dir)) {
            mkdir($dir, 0755, true);
        }

        // Create a simple dummy file with some content
        $content = "This is a sample {$extension} file for testing the download feature.\n";
        $content .= "Generated at: " . now()->toDateTimeString() . "\n";
        $content .= str_repeat("Sample content ", 1000); // Make it a bit larger

        file_put_contents($path, $content);
    }
}
