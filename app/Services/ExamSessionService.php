<?php

namespace App\Services;

use App\Models\Candidate;
use App\Models\CandidateAnswer;
use App\Models\CandidateExamSession;
use App\Models\Subject;

class ExamSessionService
{
    /**
     * Start or resume an exam session for the candidate.
     */
    public function startOrResume(Candidate $candidate, Subject $subject): CandidateExamSession
    {
        $session = CandidateExamSession::firstOrCreate(
            ['candidate_id' => $candidate->id, 'subject_id' => $subject->id],
            [
                'status' => 'pending',
            ]
        );

        if ($session->status === 'pending') {
            $session->status = 'active';
            $session->started_at = now();
            $session->expires_at = now()->addMinutes($subject->duration_minutes);
            $session->question_order = $this->randomiseQuestions($subject);
            $session->save();
        }

        return $session;
    }

    /**
     * Randomise questions based on subject settings.
     */
    protected function randomiseQuestions(Subject $subject): array
    {
        // Get active questions
        $questions = $subject->questions()->where('is_active', true)->pluck('id')->toArray();

        // Shuffle
        shuffle($questions);

        // Limit to total_questions_to_display
        if ($subject->total_questions_to_display && count($questions) > $subject->total_questions_to_display) {
            $questions = array_slice($questions, 0, $subject->total_questions_to_display);
        }

        return $questions;
    }

    /**
     * Save an answer for a question in a session.
     */
    public function saveAnswer(CandidateExamSession $session, int $questionId, ?int $optionId, bool $isFlagged = false): CandidateAnswer
    {
        return CandidateAnswer::updateOrCreate(
            [
                'candidate_exam_session_id' => $session->id,
                'question_id' => $questionId,
            ],
            [
                'selected_option_id' => $optionId,
                'is_flagged' => $isFlagged,
            ]
        );
    }

    /**
     * Submit and auto-grade the exam session.
     */
    public function submit(CandidateExamSession $session): void
    {
        if ($session->status === 'completed') {
            return;
        }

        $score = 0;
        $totalMarks = 0;

        foreach ($session->answers as $answer) {
            $question = $answer->question;
            $totalMarks += $question->marks;

            if ($answer->selectedOption && $answer->selectedOption->is_correct) {
                $answer->update(['is_correct' => true]);
                $score += $question->marks;
            } else {
                $answer->update(['is_correct' => false]);
            }
        }

        // Calculate percentage (simplistic grading for now, out of total possible for the displayed questions)
        // If we didn't store total possible, we compute based on answers + unanswered from question_order
        // For accurate grading, we should calculate total marks of all questions in question_order.

        $totalPossible = 0;
        if (is_array($session->question_order)) {
            $totalPossible = $session->subject->questions()->whereIn('id', $session->question_order)->sum('marks');
        }

        $percentage = $totalPossible > 0 ? ($score / $totalPossible) * 100 : 0;
        $passed = $percentage >= $session->subject->pass_mark;

        $session->update([
            'status' => 'completed',
            'completed_at' => now(),
            'score' => $percentage,
            'passed' => $passed,
        ]);
    }

    public function getRemainingSeconds(CandidateExamSession $session): int
    {
        if (! $session->expires_at) {
            return 0;
        }

        $diff = $session->expires_at->diffInSeconds(now(), false);

        return $diff < 0 ? abs($diff) : 0; // If diff is positive, it's past the expires_at
    }
}
