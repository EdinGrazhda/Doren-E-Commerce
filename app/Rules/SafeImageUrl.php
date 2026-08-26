<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;
use Illuminate\Translation\PotentiallyTranslatedString;

class SafeImageUrl implements ValidationRule
{
    private const array AllowedExtensions = ['jpg', 'jpeg', 'png', 'webp'];

    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            $fail('The :attribute field must be a safe image URL.');

            return;
        }

        $value = trim($value);

        if ($this->containsUnsafeCharacters($value)) {
            $fail('The :attribute field must be a safe image URL.');

            return;
        }

        if ($this->isSafeStoragePath($value) || $this->isSafeHttpUrl($value)) {
            return;
        }

        $fail('The :attribute field must be a safe image URL.');
    }

    private function containsUnsafeCharacters(string $value): bool
    {
        return preg_match('/[\x00-\x1F\x7F\\\\]/', $value) === 1;
    }

    private function isSafeStoragePath(string $value): bool
    {
        if (! Str::startsWith($value, '/storage/') || str_contains($value, '..')) {
            return false;
        }

        return $this->hasAllowedImageExtension($value);
    }

    private function isSafeHttpUrl(string $value): bool
    {
        $components = parse_url($value);

        if (! is_array($components)) {
            return false;
        }

        $scheme = Str::lower((string) ($components['scheme'] ?? ''));

        if (! in_array($scheme, ['http', 'https'], true) || blank($components['host'] ?? null)) {
            return false;
        }

        return filter_var($value, FILTER_VALIDATE_URL) !== false
            && $this->hasAllowedImageExtension((string) ($components['path'] ?? ''));
    }

    private function hasAllowedImageExtension(string $path): bool
    {
        return in_array(Str::lower(pathinfo($path, PATHINFO_EXTENSION)), self::AllowedExtensions, true);
    }
}
