<?php

namespace App\Actions\Images;

use GdImage;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class StoreOptimizedImage
{
    private const int MaxDimension = 2000;

    private const int WebpQuality = 82;

    public function handle(UploadedFile $uploadedImage, string $directory): string
    {
        if (! function_exists('imagewebp') || (imagetypes() & IMG_WEBP) === 0) {
            throw new ImageUploadFailed('image_processing_unavailable', 'The GD WebP extension is required to optimize image uploads.');
        }

        $sourceContents = file_get_contents($uploadedImage->getRealPath());
        $sourceImage = $sourceContents === false ? false : imagecreatefromstring($sourceContents);

        if (! $sourceImage instanceof GdImage) {
            throw new ImageUploadFailed('image_decode_failed', 'The uploaded image could not be decoded.');
        }

        $optimizedImage = $this->resize($sourceImage);
        ob_start();
        $encoded = imagewebp($optimizedImage, null, self::WebpQuality);
        $webpContents = ob_get_clean();

        if ($optimizedImage !== $sourceImage) {
            imagedestroy($optimizedImage);
        }

        imagedestroy($sourceImage);

        if (! $encoded || ! is_string($webpContents)) {
            throw new ImageUploadFailed('image_encode_failed', 'The uploaded image could not be encoded as WebP.');
        }

        $path = Str::finish($directory, '/').Str::uuid().'.webp';

        if (! Storage::disk('public')->put($path, $webpContents)) {
            throw new ImageUploadFailed('image_storage_failed', 'The optimized image could not be stored.');
        }

        return Storage::disk('public')->url($path);
    }

    private function resize(GdImage $sourceImage): GdImage
    {
        $width = imagesx($sourceImage);
        $height = imagesy($sourceImage);
        if ($width <= self::MaxDimension && $height <= self::MaxDimension) {
            return $sourceImage;
        }

        $scale = self::MaxDimension / max($width, $height);
        $targetWidth = max(1, (int) round($width * $scale));
        $targetHeight = max(1, (int) round($height * $scale));
        $resizedImage = imagecreatetruecolor($targetWidth, $targetHeight);

        if (! $resizedImage instanceof GdImage) {
            throw new ImageUploadFailed('image_resize_failed', 'Memory allocation failed while resizing an uploaded image.');
        }

        imagealphablending($resizedImage, false);
        imagesavealpha($resizedImage, true);
        imagecopyresampled(
            $resizedImage,
            $sourceImage,
            0,
            0,
            0,
            0,
            $targetWidth,
            $targetHeight,
            $width,
            $height,
        );

        return $resizedImage;
    }
}
