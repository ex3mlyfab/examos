<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('candidate_exam_sessions', function (Blueprint $table) {
            $table->foreignId('parent_session_id')->nullable()->constrained('candidate_exam_sessions')->onDelete('cascade')->after('subject_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('candidate_exam_sessions', function (Blueprint $table) {
            $table->dropForeign(['parent_session_id']);
            $table->dropColumn('parent_session_id');
        });
    }
};
