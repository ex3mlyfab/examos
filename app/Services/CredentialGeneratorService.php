<?php

namespace App\Services;

use Illuminate\Support\Str;

class CredentialGeneratorService
{
    /**
     * Generate a deterministic password based on the candidate's name and a random salt
     * Or simply a random string. We will use Firstname@Last4DigitsOfFileNo
     */
    public function generatePassword(string $name, string $fileNo): string
    {
        $firstName = explode(' ', trim($name))[0];
        $last4 = substr($fileNo, -4);
        
        // Ensure at least 4 chars from file no if it's too short
        if (strlen($last4) < 4) {
            $last4 = str_pad($last4, 4, '0', STR_PAD_LEFT);
        }

        return ucfirst(strtolower($firstName)) . '@' . $last4;
    }

    /**
     * Ensure the username (file_no) is properly formatted.
     */
    public function formatUsername(string $fileNo): string
    {
        return strtoupper(trim($fileNo));
    }
}
