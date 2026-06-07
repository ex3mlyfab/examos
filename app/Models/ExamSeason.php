<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class ExamSeason extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'name',
        'code',
        'description',
        'exam_mode',
        'combo_settings',
        'starts_at',
        'ends_at',
        'logout_grace_minutes',
        'status',
        'allow_result_review',
        'created_by'
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'allow_result_review' => 'boolean',
            'combo_settings' => 'array',
        ];
    }

    public function isCombinedMode(): bool
    {
        return $this->exam_mode === 'combined';
    }

    public function getComboDuration(): ?int
    {
        return $this->combo_settings['total_duration_minutes'] ?? null;
    }

    public function getSubjectOverride(string $subjectCode, string $key)
    {
        return $this->combo_settings['subject_overrides'][$subjectCode][$key] ?? null;
    }

    public function subjects(): HasMany
    {
        return $this->hasMany(Subject::class);
    }

    public function candidates(): HasMany
    {
        return $this->hasMany(Candidate::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
