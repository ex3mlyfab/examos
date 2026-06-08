<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use App\Models\CandidateExamSession;
use App\Models\Subject;
use App\Services\ExamSessionService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamController extends Controller
{
    /**
     * Show the candidate profile and allocated subjects.
     */
    public function profile()
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects', 'sessions']);

        return Inertia::render('Candidate/Profile', [
            'candidate' => $candidate,
        ]);
    }

    /**
     * Show instructions before starting the exam.
     */
    public function instructions(Subject $subject)
    {
        $candidate = auth('candidate')->user();
        if ($candidate->examSeason && $candidate->examSeason->isCombinedMode()) {
            return redirect()->route('candidate.combined-instructions');
        }

        if (! $candidate->subjects->contains($subject->id)) {
            abort(403, 'You are not allocated to this subject.');
        }

        // Redirect to room if session is already active
        $session = CandidateExamSession::where('candidate_id', $candidate->id)
            ->where('subject_id', $subject->id)
            ->first();

        if ($session && $session->status === 'active') {
            return redirect()->route('candidate.room', $subject->id);
        }

        return Inertia::render('Candidate/Exam/Instructions', [
            'subject' => $subject,
        ]);
    }

    /**
     * Start the exam and redirect to the exam room.
     */
    public function start(Subject $subject, ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user();
        if ($candidate->examSeason && $candidate->examSeason->isCombinedMode()) {
            return redirect()->route('candidate.combined-instructions');
        }

        if (! $candidate->subjects->contains($subject->id)) {
            abort(403);
        }

        $session = $examService->startOrResume($candidate, $subject);

        return redirect()->route('candidate.room', $subject->id);
    }

    /**
     * The exam room where questions are displayed.
     */
    public function room(Subject $subject, ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user();
        if ($candidate->examSeason && $candidate->examSeason->isCombinedMode()) {
            return redirect()->route('candidate.combined-room');
        }

        $session = CandidateExamSession::where('candidate_id', $candidate->id)
            ->where('subject_id', $subject->id)
            ->firstOrFail();

        if ($session->status === 'completed') {
            return redirect()->route('candidate.results');
        }

        // Fetch ordered questions with their options
        $orderedIds = $session->question_order;
        if (empty($orderedIds)) {
            $orderedIds = [];
        }

        // Retrieve questions in order using field()
        $questions = null;
        if (! empty($orderedIds)) {
            $idsString = implode(',', $orderedIds);
            $questions = $subject->questions()
                ->whereIn('id', $orderedIds)
                ->with(['options' => function ($q) {
                    $q->select('id', 'question_id', 'option_label', 'option_text');
                }])
                ->orderByRaw("FIELD(id, {$idsString})")
                ->get();
        }

        return Inertia::render('Candidate/Exam/Room', [
            'subject' => $subject,
            'session' => $session->load('answers'),
            'questions' => $questions,
            'remainingSeconds' => $examService->getRemainingSeconds($session),
        ]);
    }

    /**
     * Synchronize the timer with the backend.
     */
    public function syncTime(CandidateExamSession $session, ExamSessionService $examService)
    {
        return response()->json([
            'remainingSeconds' => $examService->getRemainingSeconds($session),
        ]);
    }

    /**
     * Save an answer asynchronously.
     */
    public function saveAnswer(Request $request, CandidateExamSession $session, ExamSessionService $examService)
    {
        $validated = $request->validate([
            'question_id' => 'required|exists:questions,id',
            'option_id' => 'nullable|exists:question_options,id',
            'is_flagged' => 'boolean',
        ]);

        $answer = $examService->saveAnswer($session, $validated['question_id'], $validated['option_id'] ?? null, $validated['is_flagged'] ?? false);

        return response()->json(['success' => true, 'answer' => $answer]);
    }

    /**
     * Submit and auto-grade the exam.
     */
    public function submit(CandidateExamSession $session, ExamSessionService $examService)
    {
        $examService->submit($session);

        return redirect()->route('candidate.results');
    }

    /**
     * Show the candidate's results.
     */
    public function results()
    {
        $candidate = auth('candidate')->user();
        $sessions = CandidateExamSession::where('candidate_id', $candidate->id)
            ->with('subject')
            ->get();

        return Inertia::render('Candidate/Exam/Results', [
            'sessions' => $sessions,
        ]);
    }

    /**
     * Show detailed scorecard for a specific session.
     */
    public function showResult(CandidateExamSession $session)
    {
        $candidate = auth('candidate')->user();
        if ($session->candidate_id !== $candidate->id) {
            abort(403);
        }

        $session->load([
            'candidate',
            'subject',
            'answers.question.options',
            'answers.selectedOption',
        ]);

        return Inertia::render('Candidate/Exam/ShowResult', [
            'session' => $session,
        ]);
    }

    /**
     * Show combined exam instructions.
     */
    public function combinedInstructions()
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects']);
        if (! $candidate->examSeason || ! $candidate->examSeason->isCombinedMode()) {
            abort(403, 'This action is only available for combined examinations.');
        }

        return Inertia::render('Candidate/Exam/CombinedInstructions', [
            'candidate' => $candidate,
            'subjects' => $candidate->subjects,
            'season' => $candidate->examSeason,
        ]);
    }

    /**
     * Start the combined exam and redirect to combined room.
     */
    public function startCombined(ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects']);
        if (! $candidate->examSeason || ! $candidate->examSeason->isCombinedMode()) {
            abort(403);
        }

        $season = $candidate->examSeason;
        $totalDuration = $season->combo_settings['total_duration_minutes'] ?? 60;
        $expiresAt = now()->addMinutes($totalDuration);

        foreach ($candidate->subjects as $subject) {
            $session = CandidateExamSession::firstOrCreate(
                ['candidate_id' => $candidate->id, 'subject_id' => $subject->id],
                [
                    'exam_season_id' => $season->id,
                    'status' => 'pending',
                ]
            );

            if ($session->status === 'pending') {
                $session->status = 'active';
                $session->started_at = now();
                $session->expires_at = $expiresAt;
                $session->question_order = $examService->randomiseQuestions($subject);
                $session->save();
            }
        }

        return redirect()->route('candidate.combined-room');
    }

    /**
     * Show the combined exam room.
     */
    public function combinedRoom(ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects']);
        if (! $candidate->examSeason || ! $candidate->examSeason->isCombinedMode()) {
            abort(403);
        }

        // Get sessions
        $sessions = CandidateExamSession::where('candidate_id', $candidate->id)
            ->whereIn('subject_id', $candidate->subjects->pluck('id'))
            ->with('answers')
            ->get();

        // Check if all are completed
        $allCompleted = $sessions->every(function ($s) {
            return $s->status === 'completed';
        });

        if ($allCompleted) {
            return redirect()->route('candidate.results');
        }

        $subjectData = [];
        $remainingSeconds = 0;

        foreach ($candidate->subjects as $subject) {
            $session = $sessions->firstWhere('subject_id', $subject->id);
            if (! $session) {
                return redirect()->route('candidate.profile');
            }

            // Sync remaining seconds from the first active session
            if ($session->status === 'active' && $remainingSeconds === 0) {
                $remainingSeconds = $examService->getRemainingSeconds($session);
            }

            $orderedIds = $session->question_order ?? [];
            $questions = [];

            if (! empty($orderedIds)) {
                $idsString = implode(',', $orderedIds);
                $questions = $subject->questions()
                    ->whereIn('id', $orderedIds)
                    ->with(['options' => function ($q) {
                        $q->select('id', 'question_id', 'option_label', 'option_text');
                    }])
                    ->orderByRaw("FIELD(id, {$idsString})")
                    ->get();
            }

            $subjectData[] = [
                'subject' => $subject,
                'session' => $session,
                'questions' => $questions,
            ];
        }

        return Inertia::render('Candidate/Exam/CombinedRoom', [
            'season' => $candidate->examSeason,
            'subjectData' => $subjectData,
            'remainingSeconds' => $remainingSeconds,
        ]);
    }

    /**
     * Submit all sessions of the combined exam.
     */
    public function submitCombined(ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects']);
        if (! $candidate->examSeason || ! $candidate->examSeason->isCombinedMode()) {
            abort(403);
        }

        $sessions = CandidateExamSession::where('candidate_id', $candidate->id)
            ->whereIn('subject_id', $candidate->subjects->pluck('id'))
            ->get();

        foreach ($sessions as $session) {
            $examService->submit($session);
        }

        return redirect()->route('candidate.results');
    }
}
