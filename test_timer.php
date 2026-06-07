<?php
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$sessions = App\Models\CandidateExamSession::with(['candidate', 'subject'])->whereIn('status', ['active', 'paused'])->get();
foreach($sessions as $s) {
    $now = now();
    $expires = $s->expires_at;
    $isFuture = $expires && $expires->isFuture();
    $diff = $isFuture ? $expires->diffInSeconds($now) : 0;
    
    echo "Session ID: {$s->id}\n";
    echo "Status: {$s->status}\n";
    echo "Now: {$now->toDateTimeString()}\n";
    echo "Expires At: " . ($expires ? $expires->toDateTimeString() : 'null') . "\n";
    echo "Is Future: " . ($isFuture ? 'Yes' : 'No') . "\n";
    echo "Diff (remaining_seconds): {$diff}\n";
    echo "--------------------\n";
}
