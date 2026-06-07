<?php

use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Admin\ExamSeasonController;
use App\Http\Controllers\Admin\CandidateController;
use App\Http\Controllers\Admin\SubjectController;
use App\Http\Controllers\Admin\QuestionController;

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

        Route::get('monitor', [\App\Http\Controllers\Admin\ExamMonitorController::class, 'index'])->name('monitor.index');
        Route::post('monitor/release-device/{candidate}', [\App\Http\Controllers\Admin\ExamMonitorController::class, 'releaseDevice'])->name('monitor.release-device');
        Route::post('monitor/force-submit/{session}', [\App\Http\Controllers\Admin\ExamMonitorController::class, 'forceSubmit'])->name('monitor.force-submit');
        Route::post('monitor/extend-time/{session}', [\App\Http\Controllers\Admin\ExamMonitorController::class, 'extendTime'])->name('monitor.extend-time');

        Route::get('results/export', [\App\Http\Controllers\Admin\ResultController::class, 'export'])->name('results.export');
        Route::get('results', [\App\Http\Controllers\Admin\ResultController::class, 'index'])->name('results.index');
        Route::get('results/{session}', [\App\Http\Controllers\Admin\ResultController::class, 'show'])->name('results.show');
    });
});

require __DIR__.'/settings.php';
