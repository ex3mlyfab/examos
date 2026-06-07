<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;

class Subject extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'exam_season_id',
        'name',
        'code',
        'duration_minutes',
        'questions_per_page',
        'total_questions_to_display',
        'pass_mark',
        'instructions',
        'allocation_criteria',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'allocation_criteria' => 'array',
            'is_active' => 'boolean',
        ];
    }

    public function examSeason(): BelongsTo
    {
        return $this->belongsTo(ExamSeason::class);
    }

    public function questions(): HasMany
    {
        return $this->hasMany(Question::class);
    }
}
