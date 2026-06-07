<?php

namespace App\Http\Controllers\Admin;

use App\Exports\ExamResultsExport;
use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\CandidateExamSession;
use App\Models\ExamSeason;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ResultController extends Controller
{
    public function index(Request $request)
    {
        $seasonId = $request->input('season_id');

        // If no season provided, pick the active one or the most recently created
        if (! $seasonId) {
            $season = ExamSeason::where('status', 'active')->first() ?? ExamSeason::latest()->first();
            $seasonId = $season ? $season->id : null;
        } else {
            $season = ExamSeason::find($seasonId);
        }

        $seasons = ExamSeason::select('id', 'name', 'status', 'exam_mode')->orderBy('created_at', 'desc')->get();

        $candidates = [];
        $subjects = [];

        if ($season) {
            // Get all subjects in this season to build dynamic columns
            $subjects = $season->subjects()->select('subjects.id', 'name', 'code')->get();

            // Fetch candidates for this season with their exam sessions
            $candidates = Candidate::where('exam_season_id', $seasonId)
                ->with(['examSessions' => function ($query) {
                    $query->select('id', 'candidate_id', 'subject_id', 'status', 'score', 'passed', 'completed_at');
                }])
                ->when($request->search, function ($query, $search) {
                    $query->where(function ($q) use ($search) {
                        $q->where('file_no', 'like', "%{$search}%")
                            ->orWhere('name', 'like', "%{$search}%");
                    });
                })
                ->paginate(20)
                ->withQueryString();
        }

        return Inertia::render('Admin/Results/Index', [
            'seasons' => $seasons,
            'currentSeason' => $season,
            'subjects' => $subjects,
            'candidates' => $candidates,
            'filters' => $request->only(['search', 'season_id']),
        ]);
    }

    public function show(CandidateExamSession $session)
    {
        $session->load([
            'candidate',
            'subject',
            'answers.question.options',
            'answers.selectedOption',
        ]);

        return Inertia::render('Admin/Results/Show', [
            'session' => $session,
        ]);
    }

    public function export(Request $request)
    {
        $seasonId = $request->input('season_id');
        $season = ExamSeason::findOrFail($seasonId);

        return Excel::download(new ExamResultsExport($season), 'results_'.str_replace(' ', '_', strtolower($season->name)).'.xlsx');
    }
}
