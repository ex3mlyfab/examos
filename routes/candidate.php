<?php

use App\Http\Controllers\Candidate\AuthController as CandidateAuthController;
use App\Http\Controllers\Candidate\ExamController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Candidate Portal Routes
|--------------------------------------------------------------------------
| These routes are completely separate from the Fortify admin routes.
| They use the 'candidate' guard and the App\Models\Candidate model.
| Fortify's /login, /register, /two-factor-challenge, etc. are NOT used here.
|--------------------------------------------------------------------------
*/

Route::prefix('candidate')->name('candidate.')->group(function () {

    // --- Guest routes (not authenticated as candidate) ---
    Route::middleware('guest:candidate')->group(function () {
        Route::get('/login', [CandidateAuthController::class, 'showLogin'])->name('login');
        Route::post('/login', [CandidateAuthController::class, 'login'])
            ->middleware('throttle:5,1')
            ->name('login.post');
    });

    Route::post('/logout', [CandidateAuthController::class, 'logout'])
        ->middleware('auth:candidate')
        ->name('logout');

    // --- Authenticated candidate routes ---
    Route::middleware(['auth:candidate', 'exam.device'])->group(function () {
        Route::get('/profile', [ExamController::class, 'profile'])->name('profile');
        Route::get('/instructions/{subject}', [ExamController::class, 'instructions'])->name('instructions');
        Route::get('/results', [ExamController::class, 'results'])->name('results');
        Route::get('/results/{session}', [ExamController::class, 'showResult'])->name('results.show');

        // Exam room routes (also validates server-side time)
        Route::middleware('exam.time')->group(function () {
            Route::get('/room/{subject}', [ExamController::class, 'room'])->name('room');
            Route::post('/start/{subject}', [ExamController::class, 'start'])->name('start');
            Route::post('/answer/{session}', [ExamController::class, 'saveAnswer'])->name('answer');
            Route::post('/submit/{session}', [ExamController::class, 'submit'])->name('submit');
        });

        // Server time sync — no time guard (used to check if expired)
        Route::get('/sync-time/{session}', [ExamController::class, 'syncTime'])->name('sync-time');
    });
});
