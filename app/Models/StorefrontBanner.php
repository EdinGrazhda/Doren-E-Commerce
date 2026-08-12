<?php

namespace App\Models;

use Database\Factories\StorefrontBannerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $position
 * @property string|null $eyebrow
 * @property string|null $title
 * @property string|null $subtitle
 * @property string|null $body
 * @property string|null $primary_action_label
 * @property string|null $primary_action_url
 * @property string|null $secondary_action_label
 * @property string|null $secondary_action_url
 * @property string|null $image_url
 * @property bool $is_active
 * @property int $sort_order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable([
    'position',
    'eyebrow',
    'title',
    'subtitle',
    'body',
    'primary_action_label',
    'primary_action_url',
    'secondary_action_label',
    'secondary_action_url',
    'image_url',
    'is_active',
    'sort_order',
])]
class StorefrontBanner extends Model
{
    public const array Positions = ['top', 'hero', 'bottom'];

    /** @use HasFactory<StorefrontBannerFactory> */
    use HasFactory;

    protected $attributes = [
        'is_active' => true,
        'sort_order' => 0,
    ];

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
