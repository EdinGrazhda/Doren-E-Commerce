<?php

namespace App\Actions\Images;

use RuntimeException;

class ImageUploadFailed extends RuntimeException
{
    public function __construct(public readonly string $reason, string $message)
    {
        parent::__construct($message);
    }
}
