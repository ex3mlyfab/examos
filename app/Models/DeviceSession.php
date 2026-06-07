<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DeviceSession extends Model
{
    protected $fillable = [
        'candidate_id',
        'device_fingerprint',
        'ip_address',
        'user_agent',
        'last_active_at',
        'is_locked'
    ];

    protected function casts(): array
    {
        return [
            'last_active_at' => 'datetime',
            'is_locked' => 'boolean',
        ];
    }

    public function candidate(): BelongsTo
    {
        return $this->belongsTo(Candidate::class);
    }
}
