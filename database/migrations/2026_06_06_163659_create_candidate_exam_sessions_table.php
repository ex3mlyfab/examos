<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidate_exam_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'active', 'paused', 'completed'])->default('pending');
            $table->timestamp('started_at')->nullable();
            $table->timestamp('expires_at')->nullable();     // Server-authoritative end time
            $table->timestamp('completed_at')->nullable();
            $table->json('question_order')->nullable();      // Randomised array of question IDs
            $table->unsignedInteger('score')->nullable();
            $table->boolean('passed')->nullable();
            $table->timestamps();
            $table->unique(['candidate_id', 'subject_id']);
            $table->index(['status', 'expires_at']);         // For auto-expire cron
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_exam_sessions');
    }
};
