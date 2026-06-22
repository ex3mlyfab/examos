<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\ExamSeason;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

class CandidateController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Candidate::with('examSeason')->orderBy('created_at', 'desc');

        if ($request->has('season_id') && $request->season_id) {
            $query->where('exam_season_id', $request->season_id);
        }

        if ($request->has('department') && $request->department) {
            $query->where('department', $request->department);
        }

        $perPage = $request->get('per_page', 20);
        if ($perPage === 'all') {
            $candidates = $query->paginate($query->count() ?: 20)->withQueryString();
        } else {
            $candidates = $query->paginate((int)$perPage)->withQueryString();
        }

        // Make raw_password visible for the admin
        $candidates->getCollection()->transform(function ($candidate) {
            return $candidate->makeVisible('raw_password');
        });

        $seasons = ExamSeason::orderBy('created_at', 'desc')->get();
        $departments = Candidate::whereNotNull('department')
            ->where('department', '!=', '')
            ->distinct()
            ->orderBy('department')
            ->pluck('department');

        return Inertia::render('Admin/Candidates/Index', [
            'candidates' => $candidates,
            'seasons' => $seasons,
            'departments' => $departments,
            'filters' => $request->only(['season_id', 'department', 'per_page']),
        ]);
    }

    /**
     * Download the CSV template for candidates upload.
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=candidates_upload_template.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['file_no', 'name', 'telephone', 'email', 'gender', 'department', 'level'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Import candidates from CSV/Excel.
     */
    public function import(Request $request)
    {
        $request->validate([
            'exam_season_id' => 'required|exists:exam_seasons,id',
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt', 'xlsx', 'xls'])) {
            return redirect()->back()->withErrors(['file' => 'The file must be a file of type: csv, txt, xlsx, xls.']);
        }

        $season = ExamSeason::findOrFail($request->exam_season_id);

        try {
            \Maatwebsite\Excel\Facades\Excel::import(new \App\Imports\CandidatesImport($season), $file);
            return redirect()->route('admin.candidates.index')->with('success', 'Candidates imported successfully.');
        } catch (\Exception $e) {
            \Log::error('Candidates import failed: '.$e->getMessage());
            return redirect()->back()->withErrors(['file' => 'Failed to process import file. Ensure the format matches the template.']);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $seasons = ExamSeason::whereIn('status', ['draft', 'active'])->get();

        return Inertia::render('Admin/Candidates/Create', [
            'seasons' => $seasons,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'exam_season_id' => 'required|exists:exam_seasons,id',
            'file_no' => 'required|string|max:255|unique:candidates,file_no',
            'name' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'gender' => 'nullable|in:M,F',
            'department' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        // Generate password from name and telephone as per requirement
        // Fallback to random if telephone is not provided
        $baseName = explode(' ', trim($validated['name']))[0];
        $basePhone = $validated['telephone'] ? substr($validated['telephone'], -4) : rand(1000, 9999);
        $rawPassword = strtolower($baseName).$basePhone;

        $validated['raw_password'] = $rawPassword;
        $validated['password'] = Hash::make($rawPassword);

        $candidate = Candidate::create($validated);

        app(\App\Services\SubjectAllocationService::class)->allocateBySubject($candidate);

        return redirect()->route('admin.candidates.index')->with('success', 'Candidate created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Candidate $candidate)
    {
        $candidate->load('examSeason', 'subjects');
        $candidate->makeVisible('raw_password');

        return Inertia::render('Admin/Candidates/Show', [
            'candidate' => $candidate,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Candidate $candidate)
    {
        $seasons = ExamSeason::orderBy('created_at', 'desc')->get();

        return Inertia::render('Admin/Candidates/Edit', [
            'candidate' => $candidate,
            'seasons' => $seasons,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Candidate $candidate)
    {
        $validated = $request->validate([
            'exam_season_id' => 'required|exists:exam_seasons,id',
            'file_no' => 'required|string|max:255|unique:candidates,file_no,'.$candidate->id,
            'name' => 'required|string|max:255',
            'telephone' => 'nullable|string|max:255',
            'email' => 'nullable|email|max:255',
            'gender' => 'nullable|in:M,F',
            'department' => 'nullable|string|max:255',
            'level' => 'nullable|string|max:255',
            'is_active' => 'boolean',
        ]);

        $candidate->update($validated);

        app(\App\Services\SubjectAllocationService::class)->allocateBySubject($candidate);

        return redirect()->route('admin.candidates.index')->with('success', 'Candidate updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Candidate $candidate)
    {
        $candidate->delete();

        return redirect()->route('admin.candidates.index')->with('success', 'Candidate deleted successfully.');
    }
}
