<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use OwenIt\Auditing\Contracts\Auditable;

class Candidate extends Authenticatable implements Auditable
{
    use SoftDeletes, \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'file_no',
        'name',
        'telephone',
        'email',
        'gender',
        'department',
        'level',
        'photo',
        'password',
        'raw_password',
        'exam_season_id',
        'is_active'
    ];

    protected $hidden = [
        'password',
        'raw_password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'is_active' => 'boolean',
        ];
    }

    public function examSeason(): BelongsTo
    {
        return $this->belongsTo(ExamSeason::class);
    }

    public function subjects(): BelongsToMany
    {
        return $this->belongsToMany(Subject::class, 'candidate_subject_allocations');
    }

    public function sessions(): HasMany
    {
        return $this->hasMany(CandidateExamSession::class);
    }

    public function examSessions(): HasMany
    {
        return $this->hasMany(CandidateExamSession::class);
    }

    public function deviceSession(): \Illuminate\Database\Eloquent\Relations\HasOne
    {
        return $this->hasOne(DeviceSession::class);
    }
}
