<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DesignerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $designers = [
            [
                'name' => 'Priya Sharma',
                'email' => 'priya@homedesign.test',
                'password' => Hash::make('password'),
                'specialty' => 'Interior Design',
                'bio' => 'Award-winning interior designer with expertise in modern minimalist and traditional Nepali aesthetics. I specialize in creating functional and beautiful living spaces that reflect your personality.',
                'hourly_rate' => 2500,
                'experience_years' => 8,
                'portfolio_url' => 'https://portfolio.example.com/priya',
                'is_available' => true,
            ],
            [
                'name' => 'Rajesh Thapa',
                'email' => 'rajesh@homedesign.test',
                'password' => Hash::make('password'),
                'specialty' => 'Architecture & Floor Planning',
                'bio' => 'Licensed architect specializing in residential projects. From floor plans to complete home designs, I help turn your dream home into reality with sustainable and cost-effective solutions.',
                'hourly_rate' => 3000,
                'experience_years' => 12,
                'portfolio_url' => 'https://portfolio.example.com/rajesh',
                'is_available' => true,
            ],
            [
                'name' => 'Anita Gurung',
                'email' => 'anita@homedesign.test',
                'password' => Hash::make('password'),
                'specialty' => 'Space Optimization',
                'bio' => 'Expert in making the most of small spaces. I help homeowners maximize their living areas through clever furniture placement, storage solutions, and smart design choices.',
                'hourly_rate' => 2000,
                'experience_years' => 5,
                'portfolio_url' => 'https://portfolio.example.com/anita',
                'is_available' => true,
            ],
            [
                'name' => 'Sunil Pradhan',
                'email' => 'sunil@homedesign.test',
                'password' => Hash::make('password'),
                'specialty' => 'Landscape & Garden Design',
                'bio' => 'Passionate about creating beautiful outdoor spaces. Specializing in both traditional Nepali gardens and modern landscape designs that complement your home architecture.',
                'hourly_rate' => 2200,
                'experience_years' => 7,
                'portfolio_url' => 'https://portfolio.example.com/sunil',
                'is_available' => true,
            ],
            [
                'name' => 'Maya Basnet',
                'email' => 'maya@homedesign.test',
                'password' => Hash::make('password'),
                'specialty' => 'Color & Material Consultation',
                'bio' => 'Color psychology expert helping you choose the perfect palette for your home. I guide clients in selecting materials, textures, and finishes that create harmonious living spaces.',
                'hourly_rate' => 1800,
                'experience_years' => 6,
                'portfolio_url' => 'https://portfolio.example.com/maya',
                'is_available' => true,
            ],
        ];

        foreach ($designers as $designerData) {
            $user = User::updateOrCreate(
                ['email' => $designerData['email']],
                $designerData
            );
            
            // Assign the designer role
            $user->assignRole('designer');
        }

        $this->command->info('Created ' . count($designers) . ' sample designers.');
    }
}
