<?php

namespace App\Exports;

use App\Models\Candidate;
use App\Models\ExamSeason;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithStyles;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;

class ExamResultsExport implements FromCollection, ShouldAutoSize, WithHeadings, WithMapping, WithStyles
{
    protected $season;

    protected $subjects;

    public function __construct(ExamSeason $season)
    {
        $this->season = $season;
        $this->subjects = $season->subjects()->orderBy('id')->get();
    }

    public function collection()
    {
        return Candidate::where('exam_season_id', $this->season->id)
            ->with(['examSessions' => function ($query) {
                $query->where('status', 'completed');
            }])
            ->get();
    }

    public function headings(): array
    {
        $headers = [
            'File No',
            'Name',
            'Phone',
            'Email',
        ];

        // Add a column for each subject
        foreach ($this->subjects as $subject) {
            $headers[] = $subject->name.' Score (%)';
        }

        $headers[] = 'Average Score (%)';
        $headers[] = 'Overall Status';

        return $headers;
    }

    public function map($candidate): array
    {
        $row = [
            $candidate->file_no,
            $candidate->name,
            $candidate->phone,
            $candidate->email,
        ];

        $totalScore = 0;
        $completedSubjectsCount = 0;
        $allPassed = true;

        // Map scores for each subject
        foreach ($this->subjects as $subject) {
            $session = $candidate->examSessions->firstWhere('subject_id', $subject->id);
            if ($session) {
                $row[] = number_format($session->score, 2);
                $totalScore += $session->score;
                $completedSubjectsCount++;
                if (! $session->passed) {
                    $allPassed = false;
                }
            } else {
                $row[] = 'N/A';
                $allPassed = false; // If they didn't complete a subject, they haven't passed the combo
            }
        }

        // Average
        $average = $completedSubjectsCount > 0 ? $totalScore / $completedSubjectsCount : 0;
        $row[] = number_format($average, 2);

        // Overall Status
        // Simplistic logic: passed if they took all subjects and passed all of them
        if ($completedSubjectsCount === 0) {
            $row[] = 'Not Started';
        } elseif ($completedSubjectsCount < $this->subjects->count()) {
            $row[] = 'Incomplete';
        } else {
            $row[] = $allPassed ? 'Passed' : 'Failed';
        }

        return $row;
    }

    public function styles(Worksheet $sheet)
    {
        return [
            1 => ['font' => ['bold' => true]],
        ];
    }
}
