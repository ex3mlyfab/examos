<?php

use App\Http\Controllers\Admin\CandidateController;
use App\Http\Controllers\Admin\ExamMonitorController;
use App\Http\Controllers\Admin\ExamSeasonController;
use App\Http\Controllers\Admin\QuestionController;
use App\Http\Controllers\Admin\ResultController;
use App\Http\Controllers\Admin\SubjectController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::prefix('admin')->name('admin.')->group(function () {
        Route::resource('exam-seasons', ExamSeasonController::class);
        Route::get('candidates/template', [CandidateController::class, 'downloadTemplate'])->name('candidates.template');
        Route::resource('candidates', CandidateController::class);
        Route::resource('subjects', SubjectController::class);

        Route::get('questions/template', [QuestionController::class, 'downloadTemplate'])->name('questions.template');
        Route::post('questions/import', [QuestionController::class, 'import'])->name('questions.import');
        Route::resource('questions', QuestionController::class);

        Route::get('monitor', [ExamMonitorController::class, 'index'])->name('monitor.index');
        Route::post('monitor/release-device/{candidate}', [ExamMonitorController::class, 'releaseDevice'])->name('monitor.release-device');
        Route::post('monitor/force-submit/{session}', [ExamMonitorController::class, 'forceSubmit'])->name('monitor.force-submit');
        Route::post('monitor/extend-time/{session}', [ExamMonitorController::class, 'extendTime'])->name('monitor.extend-time');
        // Bulk actions for combined-exam candidates (all subjects at once)
        Route::post('monitor/force-submit-candidate/{candidate}', [ExamMonitorController::class, 'forceSubmitCandidate'])->name('monitor.force-submit-candidate');
        Route::post('monitor/extend-time-candidate/{candidate}', [ExamMonitorController::class, 'extendTimeCandidate'])->name('monitor.extend-time-candidate');

        Route::get('results/export', [ResultController::class, 'export'])->name('results.export');
        Route::get('results', [ResultController::class, 'index'])->name('results.index');
        Route::get('results/{session}', [ResultController::class, 'show'])->name('results.show');
    });
});

require __DIR__.'/settings.php';
