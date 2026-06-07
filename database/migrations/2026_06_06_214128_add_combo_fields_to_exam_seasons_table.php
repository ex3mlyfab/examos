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
        Schema::table('exam_seasons', function (Blueprint $table) {
            $table->enum('exam_mode', ['per_subject', 'combined'])->default('per_subject')->after('description');
            $table->json('combo_settings')->nullable()->after('exam_mode');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('exam_seasons', function (Blueprint $table) {
            $table->dropColumn(['exam_mode', 'combo_settings']);
        });
    }
};
