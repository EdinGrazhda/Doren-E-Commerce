<?php

namespace App\Models;

use Database\Factories\SeoAuditRunFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int|null $triggered_by
 * @property string $status
 * @property string $source
 * @property int $checked_pages_count
 * @property int $issues_count
 * @property array<string, mixed>|null $summary
 * @property array<int, array{code: string, severity: string, title: string, recommendation: string, path: string|null}>|null $findings
 * @property string|null $failure_message
 * @property Carbon|null $started_at
 * @property Carbon|null $completed_at
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['triggered_by', 'status', 'source', 'checked_pages_count', 'issues_count', 'summary', 'findings', 'failure_message', 'started_at', 'completed_at'])]
#[Hidden(['triggered_by', 'updated_at'])]
class SeoAuditRun extends Model
{
    /** @use HasFactory<SeoAuditRunFactory> */
    use HasFactory;

    protected $attributes = [
        'status' => 'queued',
        'source' => 'console',
        'checked_pages_count' => 0,
        'issues_count' => 0,
        'summary' => '{}',
        'findings' => '[]',
    ];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return [
            'checked_pages_count' => 'integer',
            'issues_count' => 'integer',
            'summary' => 'array',
            'findings' => 'array',
            'started_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }
}
