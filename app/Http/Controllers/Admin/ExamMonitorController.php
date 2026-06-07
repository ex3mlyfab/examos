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
     */
    public function index()
    {
        $activeSessions = CandidateExamSession::with(['candidate', 'subject'])
            ->whereIn('status', ['active', 'paused'])
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'candidate' => [
                        'id' => $session->candidate->id,
                        'name' => $session->candidate->name,
                        'file_no' => $session->candidate->file_no,
                    ],
                    'subject' => [
                        'id' => $session->subject->id,
                        'name' => $session->subject->name,
                        'code' => $session->subject->code,
                    ],
                    'status' => $session->status,
                    'starts_at' => $session->started_at,
                    'expires_at' => $session->expires_at,
                    // If exam hasn't expired, find remaining seconds
                    'remaining_seconds' => $session->expires_at && $session->expires_at->isFuture()
                        ? (int) abs($session->expires_at->diffInSeconds(Carbon::now(), false))
                        : 0,
                    'device_locked' => $session->candidate->deviceSession !== null,
                ];
            });

        return Inertia::render('Admin/Monitor/Index', [
            'sessions' => $activeSessions,
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
     * Remotely end and score a candidate's ongoing exam.
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
     * Add extra minutes to a candidate's session.
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
}
