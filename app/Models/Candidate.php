<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use OwenIt\Auditing\Contracts\Auditable;

class Candidate extends Authenticatable implements Auditable
{
    use \OwenIt\Auditing\Auditable, SoftDeletes;

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
        'is_active',
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

    public function deviceSession(): HasOne
    {
        return $this->hasOne(DeviceSession::class);
    }
}
