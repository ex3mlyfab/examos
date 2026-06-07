<?php

namespace App\Console\Commands;

use App\Models\CandidateExamSession;
use App\Services\ExamSessionService;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class AutoExpireExamSessions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'exam:expire-sessions';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Automatically submit exam sessions that have run out of time';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = Carbon::now();

        // Find all active or paused sessions where expires_at is in the past
        $expiredSessions = CandidateExamSession::whereIn('status', ['active', 'paused'])
            ->whereNotNull('expires_at')
            ->where('expires_at', '<=', $now)
            ->get();

        if ($expiredSessions->isEmpty()) {
            $this->info('No expired sessions found.');

            return;
        }

        $count = 0;
        foreach ($expiredSessions as $session) {
            // Check if there are answers to score, then update status
            $totalMarks = 0;
            $score = 0;

            // Optional: You would normally inject ExamSessionService here,
            // but for command simplicity, we can do basic marking here
            // or resolve the service to call ->submit() if it exists.
            try {
                $examService = app(ExamSessionService::class);
                $examService->submit($session);
                $count++;
            } catch (\Exception $e) {
                Log::error("Failed to auto-expire session {$session->id}: ".$e->getMessage());

                // Fallback basic expiration
                $session->update([
                    'status' => 'expired',
                    'submitted_at' => $now,
                ]);
            }
        }

        $this->info("Successfully expired/submitted {$count} sessions.");
        Log::info("AutoExpireExamSessions: Processed {$count} expired sessions.");
    }
}
