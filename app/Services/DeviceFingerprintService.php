<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\DeviceSession;
use Illuminate\Http\Request;

class DeviceFingerprintService
{
    /**
     * Generate a device fingerprint from the current request.
     */
    public function generate(Request $request): string
    {
        // SHA-256(User-Agent + Accept-Language + IP)
        $ua = $request->header('User-Agent', 'unknown');
        $lang = $request->header('Accept-Language', 'unknown');
        $ip = $request->ip() ?? 'unknown';

        return hash('sha256', $ua . '|' . $lang . '|' . $ip);
    }

    /**
     * Lock the candidate to this specific device fingerprint.
     */
    public function lockDevice(Candidate $candidate, Request $request): void
    {
        $fingerprint = $this->generate($request);

        DeviceSession::updateOrCreate(
            ['candidate_id' => $candidate->id],
            [
                'device_fingerprint' => $fingerprint,
                'ip_address' => $request->ip(),
                'user_agent' => $request->header('User-Agent'),
                'last_active_at' => now(),
                'is_locked' => true,
            ]
        );
    }

    /**
     * Check if candidate is locked to a DIFFERENT device.
     */
    public function isLockedToOtherDevice(Candidate $candidate, Request $request): bool
    {
        $session = $candidate->deviceSession;
        
        if (!$session) {
            return false;
        }

        if (!$session->is_locked) {
            return false; // Admin has released it
        }

        return $session->device_fingerprint !== $this->generate($request);
    }

    /**
     * Release a locked device for a candidate (Admin action).
     */
    public function releaseDevice(Candidate $candidate): void
    {
        if ($candidate->deviceSession) {
            $candidate->deviceSession->update(['is_locked' => false]);
        }
    }
}
