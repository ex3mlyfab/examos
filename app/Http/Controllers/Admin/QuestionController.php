<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Question;
use App\Models\QuestionOption;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Response;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class QuestionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Question::with(['subject', 'options'])->orderBy('created_at', 'desc');

        if ($request->has('subject_id') && $request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        $questions = $query->paginate(15)->withQueryString();
        $subjects = Subject::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Questions/Index', [
            'questions' => $questions,
            'subjects' => $subjects,
            'filters' => $request->only(['subject_id']),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $subjects = Subject::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Questions/Create', [
            'subjects' => $subjects,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'question_text' => 'required|string',
            'marks' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'options' => 'required|array|min:2',
            'options.*.option_label' => 'required|string|max:10',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('questions', 'public');
        }

        DB::transaction(function () use ($validated, $imagePath) {
            $question = Question::create([
                'subject_id' => $validated['subject_id'],
                'question_text' => $validated['question_text'],
                'question_type' => 'single_choice',
                'image_path' => $imagePath,
                'marks' => $validated['marks'],
                'is_active' => $validated['is_active'] ?? true,
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['options'] as $opt) {
                $question->options()->create([
                    'option_label' => $opt['option_label'],
                    'option_text' => $opt['option_text'],
                    'is_correct' => $opt['is_correct'],
                ]);
            }
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question created successfully.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Question $question)
    {
        $question->load(['subject', 'options']);

        return Inertia::render('Admin/Questions/Show', [
            'question' => $question,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Question $question)
    {
        $question->load('options');
        $subjects = Subject::orderBy('name', 'asc')->get();

        return Inertia::render('Admin/Questions/Edit', [
            'question' => $question,
            'subjects' => $subjects,
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Question $question)
    {
        $validated = $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'question_text' => 'required|string',
            'marks' => 'required|integer|min:1',
            'is_active' => 'boolean',
            'image' => 'nullable|image|max:2048',
            'remove_image' => 'nullable|boolean',
            'options' => 'required|array|min:2',
            'options.*.id' => 'nullable|exists:question_options,id',
            'options.*.option_label' => 'required|string|max:10',
            'options.*.option_text' => 'required|string',
            'options.*.is_correct' => 'required|boolean',
        ]);

        $imagePath = $question->image_path;
        if ($request->boolean('remove_image') && $imagePath) {
            Storage::disk('public')->delete($imagePath);
            $imagePath = null;
        } elseif ($request->hasFile('image')) {
            if ($imagePath) {
                Storage::disk('public')->delete($imagePath);
            }
            $imagePath = $request->file('image')->store('questions', 'public');
        }

        DB::transaction(function () use ($validated, $question, $imagePath) {
            $question->update([
                'subject_id' => $validated['subject_id'],
                'question_text' => $validated['question_text'],
                'image_path' => $imagePath,
                'marks' => $validated['marks'],
                'is_active' => $validated['is_active'] ?? true,
            ]);

            // Track IDs to keep
            $keepOptionIds = [];

            foreach ($validated['options'] as $opt) {
                if (isset($opt['id']) && $opt['id']) {
                    // Update existing
                    $questionOption = QuestionOption::find($opt['id']);
                    if ($questionOption && $questionOption->question_id == $question->id) {
                        $questionOption->update([
                            'option_label' => $opt['option_label'],
                            'option_text' => $opt['option_text'],
                            'is_correct' => $opt['is_correct'],
                        ]);
                        $keepOptionIds[] = $questionOption->id;
                    }
                } else {
                    // Create new
                    $newOption = $question->options()->create([
                        'option_label' => $opt['option_label'],
                        'option_text' => $opt['option_text'],
                        'is_correct' => $opt['is_correct'],
                    ]);
                    $keepOptionIds[] = $newOption->id;
                }
            }

            // Delete options that were removed
            $question->options()->whereNotIn('id', $keepOptionIds)->delete();
        });

        return redirect()->route('admin.questions.index')->with('success', 'Question updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Question $question)
    {
        // Options cascade delete usually handled by database FK constraints,
        // but model event might be needed depending on migration.
        // We'll let SoftDeletes or DB handle it.
        $question->delete();

        return redirect()->route('admin.questions.index')->with('success', 'Question deleted successfully.');
    }

    /**
     * Download CSV template for bulk upload
     */
    public function downloadTemplate()
    {
        $headers = [
            'Content-type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename=question_bank_template.csv',
            'Pragma' => 'no-cache',
            'Cache-Control' => 'must-revalidate, post-check=0, pre-check=0',
            'Expires' => '0',
        ];

        $columns = ['subject_code', 'question_text', 'marks', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_option_label'];

        // Get actual subject codes to make the template sample valid and useful
        $subjectCodes = Subject::pluck('code')->take(2)->toArray();
        if (empty($subjectCodes)) {
            $subjectCodes = ['MTH-101'];
        }

        $callback = function () use ($columns, $subjectCodes) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);

            // Sample rows using actual subject codes
            $code1 = $subjectCodes[0];
            $code2 = $subjectCodes[1] ?? $code1;

            fputcsv($file, [$code1, 'What is 2 + 2?', '1', '3', '4', '5', '6', 'B']);
            fputcsv($file, [$code2, 'What is the square root of 16?', '2', '2', '4', '8', '16', 'B']);

            fclose($file);
        };

        return Response::stream($callback, 200, $headers);
    }

    /**
     * Import questions from CSV
     */
    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|max:5120',
        ]);

        $file = $request->file('file');
        $extension = strtolower($file->getClientOriginalExtension());
        if (!in_array($extension, ['csv', 'txt'])) {
            return redirect()->back()->withErrors(['file' => 'The file must be a file of type: csv, txt.']);
        }

        $count = 0;

        try {
            DB::transaction(function () use ($file, &$count) {
                $handle = fopen($file->getRealPath(), 'r');
                
                // Read first line to detect delimiter
                $firstLine = fgets($handle);
                $separator = ',';
                if (strpos($firstLine, ';') !== false && strpos($firstLine, ',') === false) {
                    $separator = ';';
                }
                
                rewind($handle);
                $header = fgetcsv($handle, 1000, $separator);

                // Fetch subjects and key them by a normalized subject code (uppercase, alphanumeric only)
                $subjectsByNormalizedCode = Subject::all()->keyBy(function ($subject) {
                    return strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $subject->code));
                });

                while (($data = fgetcsv($handle, 1000, $separator)) !== false) {
                    if (count($data) < 8) {
                        continue;
                    } // Skip malformed rows

                    $rawSubjectCode = trim($data[0]);
                    $subjectCodeNormalized = strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $rawSubjectCode));
                    $questionText = trim($data[1]);
                    $marks = (int) trim($data[2]);
                    $optA = trim($data[3]);
                    $optB = trim($data[4]);
                    $optC = trim($data[5]);
                    $optD = trim($data[6]);
                    $correctLabel = strtoupper(trim($data[7]));

                    if (!$questionText || !isset($subjectsByNormalizedCode[$subjectCodeNormalized])) {
                        continue;
                    }

                    $subject = $subjectsByNormalizedCode[$subjectCodeNormalized];

                    $question = Question::create([
                        'subject_id' => $subject->id,
                        'question_text' => $questionText,
                        'question_type' => 'single_choice',
                        'marks' => $marks ?: 1,
                        'is_active' => true,
                        'created_by' => auth()->id(),
                    ]);

                    $optionsData = [
                        ['label' => 'A', 'text' => $optA],
                        ['label' => 'B', 'text' => $optB],
                        ['label' => 'C', 'text' => $optC],
                        ['label' => 'D', 'text' => $optD],
                    ];

                    foreach ($optionsData as $opt) {
                        if ($opt['text'] === '') {
                            continue;
                        }
                        $question->options()->create([
                            'option_label' => $opt['label'],
                            'option_text' => $opt['text'],
                            'is_correct' => ($opt['label'] === $correctLabel),
                        ]);
                    }
                    $count++;
                }
                fclose($handle);
            });

            if ($count === 0) {
                return redirect()->back()->withErrors([
                    'file' => 'No questions were imported. Please check that the subject codes in your CSV match the subject codes in the system.'
                ]);
            }

            return redirect()->route('admin.questions.index')->with('success', "Successfully imported {$count} questions.");
        } catch (\Exception $e) {
            Log::error('Question import failed: '.$e->getMessage());

            return redirect()->back()->withErrors(['file' => 'Failed to process CSV file. Ensure the format matches the template.']);
        }
    }
}
