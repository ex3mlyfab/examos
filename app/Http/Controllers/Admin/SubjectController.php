<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use App\Models\ExamSeason;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SubjectController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Subject::with('examSeason')->orderBy('created_at', 'desc');

        if ($request->has('season_id') && $request->season_id) {
            $query->where('exam_season_id', $request->season_id);
        }

        $subjects = $query->paginate(15)->withQueryString();
        $seasons = ExamSeason::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'seasons' => $seasons,
            'filters' => $request->only(['season_id'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $seasons = ExamSeason::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Subjects/Create', [
            'seasons' => $seasons
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_season_id' => 'required|exists:exam_seasons,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code',
            'duration_minutes' => 'required|integer|min:1',
            'total_questions_to_display' => 'required|integer|min:1',
            'pass_mark' => 'required|integer|min:0|max:100',
            'instructions' => 'nullable|string',
            'allocation_criteria' => 'nullable|json',
            'is_active' => 'boolean'
        ]);

        if (isset($validated['allocation_criteria'])) {
            $validated['allocation_criteria'] = json_decode($validated['allocation_criteria'], true);
        }

        Subject::create($validated);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Subject $subject)
    {
        $subject->load('examSeason');
        return Inertia::render('Admin/Subjects/Show', [
            'subject' => $subject
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Subject $subject)
    {
        $seasons = ExamSeason::orderBy('created_at', 'desc')->get();
        
        // Convert allocation_criteria array back to JSON string for the form if it exists
        $subjectData = $subject->toArray();
        if (isset($subjectData['allocation_criteria']) && is_array($subjectData['allocation_criteria'])) {
            $subjectData['allocation_criteria'] = json_encode($subjectData['allocation_criteria'], JSON_PRETTY_PRINT);
        }

        return Inertia::render('Admin/Subjects/Edit', [
            'subject' => $subjectData,
            'seasons' => $seasons
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'exam_season_id' => 'required|exists:exam_seasons,id',
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:subjects,code,' . $subject->id,
            'duration_minutes' => 'required|integer|min:1',
            'total_questions_to_display' => 'required|integer|min:1',
            'pass_mark' => 'required|integer|min:0|max:100',
            'instructions' => 'nullable|string',
            'allocation_criteria' => 'nullable|json',
            'is_active' => 'boolean'
        ]);

        if (isset($validated['allocation_criteria'])) {
            $validated['allocation_criteria'] = json_decode($validated['allocation_criteria'], true);
        }

        $subject->update($validated);

        return redirect()->route('admin.subjects.index')->with('success', 'Subject updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Subject $subject)
    {
        $subject->delete();

        return redirect()->route('admin.subjects.index')->with('success', 'Subject deleted successfully.');
    }
}
