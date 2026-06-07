<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('candidate.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
}, ['guards' => ['candidate']]);
