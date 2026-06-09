<?php

namespace App\Http\Middleware;

use App\Services\DeviceFingerprintService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureDeviceNotLocked
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $guard = Auth::guard('candidate');

        if ($guard->check()) {
            $candidate = $guard->user();
            $deviceService = app(DeviceFingerprintService::class);

            if ($deviceService->isLockedToOtherDevice($candidate, $request)) {
                $guard->logout();
                $request->session()->invalidate();
                $request->session()->regenerateToken();

                return redirect()->route('candidate.login')
                    ->withErrors(['device' => 'Your account is locked to another device. Please contact an admin.']);
            }

            // Lock device only when accessing exam-related routes
            $examRoutes = [
                'candidate.room',
                'candidate.combined-room',
                'candidate.start',
                'candidate.start-combined',
                'candidate.answer',
                'candidate.submit',
                'candidate.submit-combined',
                'candidate.sync-time'
            ];

            if ($request->route() && in_array($request->route()->getName(), $examRoutes)) {
                $deviceService->lockDevice($candidate, $request);
            }
        }

        return $next($request);
    }
}
