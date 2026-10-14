<?php

namespace App\Http\Requests\Admin;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreStorefrontBannerRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return $this->user()?->can('banners.create') === true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isBottomBanner = $this->input('position') === 'bottom';

        return [
            'position' => ['sometimes', Rule::in(['hero', 'bottom'])],
            'title' => ['required', 'string', 'max:255'],
            'subtitle' => [Rule::excludeIf($isBottomBanner), Rule::requiredIf(! $isBottomBanner), 'string', 'max:1000'],
            'eyebrow' => [Rule::excludeIf(! $isBottomBanner), 'required', 'string', 'max:255'],
            'body' => [Rule::excludeIf(! $isBottomBanner), 'required', 'string', 'max:1000'],
            'primary_action_label' => [Rule::excludeIf(! $isBottomBanner), 'required', 'string', 'max:255'],
            'primary_action_url' => [Rule::excludeIf(! $isBottomBanner), 'required', 'string', 'max:2048', 'regex:/^(#|\/(?!\/))[^\s]*$/'],
            'image_upload' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'mimetypes:image/jpeg,image/png,image/webp', 'extensions:jpg,jpeg,png,webp', 'max:5120'],
        ];
    }
}
