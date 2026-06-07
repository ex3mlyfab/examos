<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Services\DeviceFingerprintService;

class AuthController extends Controller
{
    /**
     * Show the candidate login form.
     */
    public function showLogin()
    {
        return Inertia::render('Candidate/Auth/Login');
    }

    /**
     * Handle candidate login request.
     */
    public function login(Request $request, DeviceFingerprintService $deviceService)
    {
        $credentials = $request->validate([
            'file_no' => ['required', 'string'],
            'password' => ['required', 'string'],
        ]);

        $guard = Auth::guard('candidate');

        if ($guard->attempt($credentials)) {
            $candidate = $guard->user();

            if (!$candidate->is_active) {
                $guard->logout();
                return back()->withErrors(['file_no' => 'Your account is inactive. Please contact an administrator.']);
            }

            // Check if locked to another device
            if ($deviceService->isLockedToOtherDevice($candidate, $request)) {
                $guard->logout();
                return back()->withErrors(['file_no' => 'Your account is locked to another device. Please contact an administrator to release it.']);
            }

            // Lock to this device
            $deviceService->lockDevice($candidate, $request);

            $request->session()->regenerate();

            return redirect()->route('candidate.profile');
        }

        return back()->withErrors([
            'file_no' => 'The provided credentials do not match our records.',
        ]);
    }

    /**
     * Log the candidate out of the application.
     */
    public function logout(Request $request)
    {
        Auth::guard('candidate')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('candidate.login');
    }
}
