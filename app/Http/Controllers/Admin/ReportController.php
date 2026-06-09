<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CandidateExamSession;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index()
    {
        // Simple aggregate data for reporting
        $sessions = CandidateExamSession::with('subject')->whereNotNull('score')->get();
        
        $totalSessions = $sessions->count();
        $totalPassed = 0;
        $subjectStats = [];

        foreach ($sessions as $session) {
            $subjectId = $session->subject_id;
            $passMark = $session->subject->pass_mark ?? 50;
            $percentage = $session->total_marks > 0 ? ($session->score / $session->total_marks) * 100 : 0;
            
            if ($percentage >= $passMark) {
                $totalPassed++;
            }

            if (!isset($subjectStats[$subjectId])) {
                $subjectStats[$subjectId] = [
                    'name' => $session->subject->name,
                    'total_attempts' => 0,
                    'passed' => 0,
                    'total_score_percentage' => 0,
                ];
            }

            $subjectStats[$subjectId]['total_attempts']++;
            $subjectStats[$subjectId]['total_score_percentage'] += $percentage;
            if ($percentage >= $passMark) {
                $subjectStats[$subjectId]['passed']++;
            }
        }

        // Calculate averages
        foreach ($subjectStats as &$stat) {
            $stat['average_score'] = $stat['total_attempts'] > 0 
                ? round($stat['total_score_percentage'] / $stat['total_attempts'], 2) 
                : 0;
            $stat['pass_rate'] = $stat['total_attempts'] > 0
                ? round(($stat['passed'] / $stat['total_attempts']) * 100, 2)
                : 0;
        }

        $overallPassRate = $totalSessions > 0 ? round(($totalPassed / $totalSessions) * 100, 2) : 0;

        return Inertia::render('Admin/Reports/Index', [
            'totalSessions' => $totalSessions,
            'overallPassRate' => $overallPassRate,
            'subjectStats' => array_values($subjectStats),
        ]);
    }
}
