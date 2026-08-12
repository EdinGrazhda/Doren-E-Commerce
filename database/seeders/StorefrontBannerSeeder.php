<?php

namespace Database\Seeders;

use App\Models\StorefrontBanner;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class StorefrontBannerSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        foreach ($this->banners() as $banner) {
            StorefrontBanner::updateOrCreate(
                [
                    'position' => $banner['position'],
                    'sort_order' => $banner['sort_order'],
                ],
                $banner,
            );
        }
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function banners(): array
    {
        return [
            [
                'position' => 'top',
                'eyebrow' => null,
                'title' => null,
                'subtitle' => null,
                'body' => 'Complimentary shipping on orders over $150',
                'primary_action_label' => null,
                'primary_action_url' => null,
                'secondary_action_label' => null,
                'secondary_action_url' => null,
                'image_url' => null,
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'position' => 'hero',
                'eyebrow' => null,
                'title' => 'Timeless style. Modern man.',
                'subtitle' => 'Refined essentials, masterfully crafted. For the man who values quality in every detail.',
                'body' => null,
                'primary_action_label' => 'Shop Collection',
                'primary_action_url' => '#new-in',
                'secondary_action_label' => 'Explore',
                'secondary_action_url' => '#shop-by-category',
                'image_url' => 'https://images.unsplash.com/photo-1516826957135-700dedea698c?auto=format&fit=crop&w=1800&q=90',
                'is_active' => true,
                'sort_order' => 10,
            ],
            [
                'position' => 'bottom',
                'eyebrow' => 'Spring / Summer 2026',
                'title' => 'Elevated Essentials For Every Day',
                'subtitle' => null,
                'body' => 'Versatile pieces. Timeless appeal. Designed for wherever life takes you.',
                'primary_action_label' => 'Explore The Collection',
                'primary_action_url' => '#new-in',
                'secondary_action_label' => null,
                'secondary_action_url' => null,
                'image_url' => 'https://images.unsplash.com/photo-1507680434567-5739c80be1ac?auto=format&fit=crop&w=1800&q=90',
                'is_active' => true,
                'sort_order' => 10,
            ],
        ];
    }
}
