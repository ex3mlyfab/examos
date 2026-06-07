<?php

namespace App\Imports;

use App\Models\Subject;
use App\Models\Question;
use App\Models\QuestionOption;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Illuminate\Support\Facades\DB;

class QuestionBankImport implements ToCollection, WithHeadingRow
{
    protected Subject $subject;

    public function __construct(Subject $subject)
    {
        $this->subject = $subject;
    }

    public function collection(Collection $rows)
    {
        DB::transaction(function () use ($rows) {
            foreach ($rows as $row) {
                if (empty($row['question_text'])) continue;

                $question = Question::create([
                    'subject_id' => $this->subject->id,
                    'question_text' => $row['question_text'],
                    'question_type' => $row['question_type'] ?? 'multiple_choice',
                    'marks' => $row['marks'] ?? 1,
                    'is_active' => true,
                    'created_by' => auth()->id(),
                ]);

                // Assuming columns like option_a, option_b, option_c, option_d, and correct_option
                $optionsMap = [
                    'A' => $row['option_a'] ?? null,
                    'B' => $row['option_b'] ?? null,
                    'C' => $row['option_c'] ?? null,
                    'D' => $row['option_d'] ?? null,
                ];

                $correctOptionLabel = strtoupper($row['correct_option'] ?? '');

                foreach ($optionsMap as $label => $text) {
                    if ($text) {
                        QuestionOption::create([
                            'question_id' => $question->id,
                            'option_label' => $label,
                            'option_text' => $text,
                            'is_correct' => ($label === $correctOptionLabel),
                        ]);
                    }
                }
            }
        });
    }
}
