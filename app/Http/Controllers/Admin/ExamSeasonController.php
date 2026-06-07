<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ExamSeason;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ExamSeasonController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $seasons = ExamSeason::orderBy('created_at', 'desc')->paginate(10);
        return Inertia::render('Admin/ExamSeasons/Index', [
            'seasons' => $seasons
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/ExamSeasons/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_seasons,code',
            'description' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required|in:draft,active,completed',
            'allow_result_review' => 'boolean',
            'exam_mode' => 'required|in:per_subject,combined',
            'combo_settings' => 'nullable|array'
        ]);

        $validated['created_by'] = auth()->id();

        ExamSeason::create($validated);

        return redirect()->route('admin.exam-seasons.index')->with('success', 'Exam Season created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ExamSeason $examSeason)
    {
        return Inertia::render('Admin/ExamSeasons/Show', [
            'season' => $examSeason
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ExamSeason $examSeason)
    {
        return Inertia::render('Admin/ExamSeasons/Edit', [
            'season' => $examSeason
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ExamSeason $examSeason)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => 'required|string|max:50|unique:exam_seasons,code,' . $examSeason->id,
            'description' => 'nullable|string',
            'starts_at' => 'nullable|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
            'status' => 'required|in:draft,active,completed',
            'allow_result_review' => 'boolean',
            'exam_mode' => 'required|in:per_subject,combined',
            'combo_settings' => 'nullable|array'
        ]);

        $examSeason->update($validated);

        return redirect()->route('admin.exam-seasons.index')->with('success', 'Exam Season updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ExamSeason $examSeason)
    {
        $examSeason->delete();

        return redirect()->route('admin.exam-seasons.index')->with('success', 'Exam Season deleted successfully.');
    }
}

