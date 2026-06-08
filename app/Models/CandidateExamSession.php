<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use OwenIt\Auditing\Contracts\Auditable;

class CandidateExamSession extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;

    protected $fillable = [
        'candidate_id',
        'subject_id',
        'parent_session_id',
        'status',
        'started_at',
        'expires_at',
        'completed_at',
        'question_order',
        'score',
        'passed',
    ];

    protected function casts(): array
    {
        return [
            'started_at'    => 'datetime',
            'expires_at'    => 'datetime',
            'completed_at'  => 'datetime',
            'question_order'=> 'array',
            'passed'        => 'boolean',
            'score'         => 'float',
        ];
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }

    public function subject(): BelongsTo
    {
        return $this->belongsTo(Subject::class);
    }

    public function answers(): HasMany
    {
        return $this->hasMany(CandidateAnswer::class);
    }

    public function parentSession(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_session_id');
    }

    public function childSessions(): HasMany
    {
        return $this->hasMany(self::class, 'parent_session_id');
    }
}
