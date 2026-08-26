<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Str;
use Illuminate\Translation\PotentiallyTranslatedString;

class SafeActionUrl implements ValidationRule
{
    /**
     * Run the validation rule.
     *
     * @param  Closure(string, ?string=): PotentiallyTranslatedString  $fail
     */
    public function validate(string $attribute, mixed $value, Closure $fail): void
    {
        if (! is_string($value) || trim($value) === '') {
            $fail('The :attribute field must be a safe URL.');

            return;
        }

        $value = trim($value);

        if ($this->containsUnsafeCharacters($value)) {
            $fail('The :attribute field must be a safe URL.');

            return;
        }

        if ($this->isSafeFragment($value) || $this->isSafeRelativeUrl($value) || $this->isSafeHttpUrl($value)) {
            return;
        }

        $fail('The :attribute field must be a safe URL.');
    }

    private function containsUnsafeCharacters(string $value): bool
    {
        return preg_match('/[\x00-\x1F\x7F\\\\]/', $value) === 1;
    }

    private function isSafeFragment(string $value): bool
    {
        return preg_match('/^#[A-Za-z0-9_-]+$/', $value) === 1;
    }

    private function isSafeRelativeUrl(string $value): bool
    {
        if (! Str::startsWith($value, '/') || Str::startsWith($value, '//') || str_contains($value, '..')) {
            return false;
        }

        return preg_match('/^\/[A-Za-z0-9\/._~%?=&#+-]*$/', $value) === 1;
    }

    private function isSafeHttpUrl(string $value): bool
    {
        $components = parse_url($value);

        if (! is_array($components)) {
            return false;
        }

        $scheme = Str::lower((string) ($components['scheme'] ?? ''));

        return in_array($scheme, ['http', 'https'], true)
            && filled($components['host'] ?? null)
            && filter_var($value, FILTER_VALIDATE_URL) !== false;
    }
}
