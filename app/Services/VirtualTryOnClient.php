<?php

namespace App\Services;

use App\Models\VirtualTryOn;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Storage;
use RuntimeException;

class VirtualTryOnClient
{
    private const int MaxBytes = 15 * 1024 * 1024;

    public function generate(VirtualTryOn $tryOn): string
    {
        if (config('virtual-try-on.driver') !== 'service') {
            throw new RuntimeException('A real try-on service is required for generation.');
        }

        $garment = $this->garment($tryOn->garment_image_url);
        $person = Storage::disk('try-ons')->get($tryOn->personPath());
        $response = Http::withToken(config('virtual-try-on.token'))
            ->connectTimeout(5)->timeout(240)
            ->withOptions(['allow_redirects' => false])
            ->withHeaders(['Accept' => 'image/png'])
            ->attach('person_image', $person, 'person')
            ->attach('garment_image', $garment, 'garment')
            ->post(rtrim(config('virtual-try-on.url'), '/').'/v1/try-on', [
                'category' => $tryOn->category,
                'garment_photo_type' => $tryOn->garment_photo_type,
            ]);

        if (! $response->successful()) {
            // Do not include response bodies or customer images in failed job logs.
            throw new RuntimeException('Try-on service returned HTTP '.$response->status().'.');
        }

        $contents = $response->body();
        $this->validateImage($contents, true);

        return $contents;
    }

    public function garment(string $url): string
    {
        $publicBase = rtrim(Storage::disk('public')->url(''), '/').'/';
        $path = null;
        if (str_starts_with($url, $publicBase)) {
            $path = substr($url, strlen($publicBase));
        } elseif (str_starts_with($url, '/storage/')) {
            $path = substr($url, strlen('/storage/'));
        }

        if ($path !== null) {
            if (preg_match('~(^|/|\\\\)\.\.(/|\\\\|$)~', rawurldecode($path)) || str_contains($path, '%') || str_contains($path, '\\')) {
                throw new RuntimeException('Invalid catalog image path.');
            }
            if (Storage::disk('public')->size($path) > self::MaxBytes) {
                throw new RuntimeException('Catalog image is too large.');
            }
            $contents = Storage::disk('public')->get($path);
        } else {
            $parts = parse_url($url);
            if (! is_array($parts) || ($parts['scheme'] ?? '') !== 'https'
                || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])
                || ! in_array($parts['host'] ?? '', config('virtual-try-on.remote_image_hosts'), true)) {
                throw new RuntimeException('Catalog image host is not allowed.');
            }
            $response = Http::connectTimeout(5)->timeout(20)
                ->withOptions(['allow_redirects' => false, 'stream' => true])->get($url);
            if (! $response->successful()) {
                throw new RuntimeException('Catalog image is unavailable.');
            }
            $stream = $response->toPsrResponse()->getBody();
            $contents = '';
            try {
                while (! $stream->eof()) {
                    $contents .= $stream->read(65536);
                    if (strlen($contents) > self::MaxBytes) {
                        throw new RuntimeException('Catalog image is too large.');
                    }
                }
            } finally {
                $stream->close();
            }
        }
        $this->validateImage($contents);

        return $contents;
    }

    private function validateImage(string $contents, bool $pngOnly = false): void
    {
        $dimensions = @getimagesizefromstring($contents);
        if (strlen($contents) > self::MaxBytes || $dimensions === false
            || $dimensions[0] * $dimensions[1] > 36000000
            || ! in_array($dimensions[2], $pngOnly ? [IMAGETYPE_PNG] : [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP], true)) {
            throw new RuntimeException('Try-on image is invalid.');
        }
    }
}
