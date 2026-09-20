<?php

namespace App\Models;

use Database\Factories\VirtualTryOnFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $owner_hash
 * @property string $status
 * @property string $category
 * @property string $garment_photo_type
 * @property string $garment_image_url
 * @property Carbon $expires_at
 * @property Carbon $created_at
 */
#[Fillable(['owner_hash', 'product_variant_id', 'status', 'category', 'garment_photo_type', 'garment_image_url', 'expires_at'])]
class VirtualTryOn extends Model
{
    /** @use HasFactory<VirtualTryOnFactory> */
    use HasFactory;

    use HasUuids;

    protected $attributes = ['status' => 'queued'];

    protected $hidden = ['owner_hash', 'garment_image_url'];

    /** @return array<string, string> */
    protected function casts(): array
    {
        return ['expires_at' => 'datetime'];
    }

    public function personPath(): string
    {
        return $this->id.'/person';
    }

    public function resultPath(): string
    {
        return $this->id.'/result.png';
    }
}
