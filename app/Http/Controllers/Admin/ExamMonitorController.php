<?php

namespace App\Http\Controllers\Admin;

use App\Events\AdminReleasedDevice;
use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\CandidateExamSession;
use App\Models\DeviceSession;
use App\Services\ExamSessionService;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamMonitorController extends Controller
{
    /**
     * Display the live monitor dashboard.
     * Combined-exam candidates are collapsed into a single row.
     */
    public function index()
    {
        $activeSessions = CandidateExamSession::with(['candidate.examSeason', 'candidate.deviceSession', 'subject'])
            ->whereIn('status', ['active', 'paused'])
            ->orderBy('updated_at', 'desc')
            ->get();

        // Group by candidate so combined-exam sittings appear as one row
        $grouped = $activeSessions->groupBy('candidate_id')->map(function ($sessions) {
            $first     = $sessions->first();
            $candidate = $first->candidate;
            $season    = $candidate->examSeason;
            $isCombined = $season && $season->isCombinedMode();

            // For the shared timer use the first active session's expires_at
            $expiresAt = $sessions->sortBy('expires_at')->first()?->expires_at;
            $remainingSeconds = $expiresAt && $expiresAt->isFuture()
                ? (int) abs($expiresAt->diffInSeconds(Carbon::now(), false))
                : 0;

            return [
                // Primary session id — used for single-subject actions
                'id'              => $first->id,
                // All session IDs for bulk combined actions
                'session_ids'     => $sessions->pluck('id')->values(),
                'candidate'       => [
                    'id'      => $candidate->id,
                    'name'    => $candidate->name,
                    'file_no' => $candidate->file_no,
                ],
                'is_combined'     => $isCombined,
                'season_name'     => $season?->name,
                // Single subject (per_subject mode)
                'subject'         => $isCombined ? null : [
                    'id'   => $first->subject->id,
                    'name' => $first->subject->name,
                    'code' => $first->subject->code,
                ],
                // All subjects (combined mode)
                'subjects'        => $isCombined
                    ? $sessions->map(fn($s) => [
                        'id'     => $s->subject->id,
                        'name'   => $s->subject->name,
                        'code'   => $s->subject->code,
                        'status' => $s->status,
                      ])->values()
                    : [],
                'status'          => $first->status,
                'starts_at'       => $first->started_at,
                'expires_at'      => $expiresAt,
                'remaining_seconds' => $remainingSeconds,
                'device_locked'   => $candidate->deviceSession !== null,
            ];
        })->values();

        return Inertia::render('Admin/Monitor/Index', [
            'rows' => $grouped,
        ]);
    }

    /**
     * Release the device lock for a candidate.
     */
    public function releaseDevice(Request $request, Candidate $candidate)
    {
        // Delete the device session
        DeviceSession::where('candidate_id', $candidate->id)->delete();

        // Broadcast to the candidate so their UI can react
        broadcast(new AdminReleasedDevice($candidate->id));

        activity()
            ->performedOn($candidate)
            ->causedBy(auth()->user())
            ->log('Released candidate device lock');

        return back()->with('success', 'Device lock released successfully.');
    }

    /**
     * Remotely end and score a candidate's ongoing exam (single session).
     */
    public function forceSubmit(Request $request, CandidateExamSession $session, ExamSessionService $examService)
    {
        if (! in_array($session->status, ['active', 'paused'])) {
            return back()->with('error', 'Session is already completed or expired.');
        }

        $examService->submit($session);

        activity()
            ->performedOn($session)
            ->causedBy(auth()->user())
            ->log('Force submitted exam session');

        return back()->with('success', 'Exam session force-submitted.');
    }

    /**
     * Force-submit ALL active sessions for a combined-exam candidate.
     */
    public function forceSubmitCandidate(Request $request, Candidate $candidate, ExamSessionService $examService)
    {
        $sessions = CandidateExamSession::where('candidate_id', $candidate->id)
            ->whereIn('status', ['active', 'paused'])
            ->get();

        foreach ($sessions as $session) {
            $examService->submit($session);
        }

        activity()
            ->performedOn($candidate)
            ->causedBy(auth()->user())
            ->log('Force submitted all combined exam sessions for candidate');

        return back()->with('success', "All {$sessions->count()} combined sessions force-submitted.");
    }

    /**
     * Add extra minutes to a single candidate session.
     */
    public function extendTime(Request $request, CandidateExamSession $session)
    {
        $request->validate([
            'minutes' => ['required', 'integer', 'min:1', 'max:120'],
        ]);

        if (! in_array($session->status, ['active', 'paused'])) {
            return back()->with('error', 'Cannot extend time on a completed session.');
        }

        if ($session->expires_at) {
            $session->expires_at = $session->expires_at->addMinutes($request->minutes);
            $session->save();
        }

        activity()
            ->performedOn($session)
            ->causedBy(auth()->user())
            ->log("Extended exam session by {$request->minutes} minutes");

        return back()->with('success', "Added {$request->minutes} minutes to the session.");
    }

    /**
     * Extend time on ALL active sessions for a combined-exam candidate (keeps expiry in sync).
     */
    public function extendTimeCandidate(Request $request, Candidate $candidate)
    {
        $request->validate([
            'minutes' => ['required', 'integer', 'min:1', 'max:120'],
        ]);

        $sessions = CandidateExamSession::where('candidate_id', $candidate->id)
            ->whereIn('status', ['active', 'paused'])
            ->get();

        foreach ($sessions as $session) {
            if ($session->expires_at) {
                $session->expires_at = $session->expires_at->addMinutes($request->minutes);
                $session->save();
            }
        }

        activity()
            ->performedOn($candidate)
            ->causedBy(auth()->user())
            ->log("Extended all combined exam sessions by {$request->minutes} minutes");

        return back()->with('success', "Added {$request->minutes} minutes to all {$sessions->count()} combined sessions.");
    }
}
