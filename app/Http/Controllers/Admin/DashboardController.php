<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\ExamSeason;
use App\Models\Question;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        $stats = [
            'totalCandidates' => Candidate::count(),
            'activeSeasons' => ExamSeason::where('status', 'active')->count(),
            'totalSubjects' => Subject::count(),
            'totalQuestions' => Question::count(),
        ];

        return Inertia::render('dashboard', [
            'stats' => $stats,
        ]);
    }
}
