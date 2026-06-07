<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CandidateAnswer extends Model
{
    protected $fillable = [
        'candidate_exam_session_id',
        'question_id',
        'selected_option_id',
        'is_correct',
        'is_flagged'
    ];

    protected function casts(): array
    {
        return [
            'is_correct' => 'boolean',
            'is_flagged' => 'boolean',
        ];
    }

    public function session(): BelongsTo
    {
        return $this->belongsTo(CandidateExamSession::class, 'candidate_exam_session_id');
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function selectedOption(): BelongsTo
    {
        return $this->belongsTo(QuestionOption::class, 'selected_option_id');
    }
}
