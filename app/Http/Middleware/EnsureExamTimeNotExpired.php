<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\CandidateExamSession;

class EnsureExamTimeNotExpired
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Requires {session} parameter in the route
        $session = $request->route('session');

        if ($session instanceof CandidateExamSession) {
            if ($session->status === 'completed') {
                return redirect()->route('candidate.results'); // Or some completion page
            }

            if ($session->expires_at && now()->isAfter($session->expires_at)) {
                $examService = app(\App\Services\ExamSessionService::class);
                $examService->submit($session);
                
                if ($request->wantsJson()) {
                    return response()->json(['message' => 'Exam time expired.'], 403);
                }
                
                return redirect()->route('candidate.profile')
                    ->with('error', 'Time has expired for this exam.');
            }
        }

        return $next($request);
    }
}
