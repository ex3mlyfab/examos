<?php

namespace App\Http\Controllers\Candidate;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Subject;
use App\Models\CandidateExamSession;
use App\Services\ExamSessionService;

class ExamController extends Controller
{
    /**
     * Show the candidate profile and allocated subjects.
     */
    public function profile()
    {
        $candidate = auth('candidate')->user()->load(['examSeason', 'subjects', 'sessions']);
        return Inertia::render('Candidate/Profile', [
            'candidate' => $candidate
        ]);
    }

    /**
     * Show instructions before starting the exam.
     */
    public function instructions(Subject $subject)
    {
        $candidate = auth('candidate')->user();
        if (!$candidate->subjects->contains($subject->id)) {
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
            'subject' => $subject
        ]);
    }

    /**
     * Start the exam and redirect to the exam room.
     */
    public function start(Subject $subject, ExamSessionService $examService)
    {
        $candidate = auth('candidate')->user();
        if (!$candidate->subjects->contains($subject->id)) {
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
        if (!empty($orderedIds)) {
            $idsString = implode(',', $orderedIds);
            $questions = $subject->questions()
                ->whereIn('id', $orderedIds)
                ->with(['options' => function($q) {
                    $q->select('id', 'question_id', 'option_label', 'option_text');
                }])
                ->orderByRaw("FIELD(id, {$idsString})")
                ->get();
        }

        return Inertia::render('Candidate/Exam/Room', [
            'subject' => $subject,
            'session' => $session->load('answers'),
            'questions' => $questions,
            'remainingSeconds' => $examService->getRemainingSeconds($session)
        ]);
    }

    /**
     * Synchronize the timer with the backend.
     */
    public function syncTime(CandidateExamSession $session, ExamSessionService $examService)
    {
        return response()->json([
            'remainingSeconds' => $examService->getRemainingSeconds($session)
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
            'is_flagged' => 'boolean'
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
            'sessions' => $sessions
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
            'answers.selectedOption'
        ]);

        return Inertia::render('Candidate/Exam/ShowResult', [
            'session' => $session
        ]);
    }
}
