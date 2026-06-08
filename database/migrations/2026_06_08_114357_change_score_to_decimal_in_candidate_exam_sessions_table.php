<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('candidate_exam_sessions', function (Blueprint $table) {
            // Change from unsignedInteger to decimal(6,2) so percentage scores
            // like 62.5 are stored accurately instead of being truncated.
            $table->decimal('score', 6, 2)->nullable()->change();
        });
    }

    public function down(): void
    {
        Schema::table('candidate_exam_sessions', function (Blueprint $table) {
            $table->unsignedInteger('score')->nullable()->change();
        });
    }
};
