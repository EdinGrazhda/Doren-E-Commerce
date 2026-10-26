<?php

namespace Database\Factories;

use App\Models\SeoAuditRun;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SeoAuditRun>
 */
class SeoAuditRunFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'source' => 'console',
            'status' => 'queued',
            'checked_pages_count' => 0,
            'issues_count' => 0,
            'summary' => [],
            'findings' => [],
        ];
    }
}
