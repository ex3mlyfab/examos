<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidate_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_exam_session_id')->constrained('candidate_exam_sessions')->onDelete('cascade');
            $table->foreignId('question_id')->constrained()->onDelete('cascade');
            $table->foreignId('selected_option_id')->nullable()->constrained('question_options')->onDelete('set null');
            $table->boolean('is_correct')->nullable();       // Populated on submit/auto-grade
            $table->boolean('is_flagged')->default(false);   // Review later
            $table->timestamps();
            $table->unique(['candidate_exam_session_id', 'question_id'], 'cand_exam_quest_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_answers');
    }
};
