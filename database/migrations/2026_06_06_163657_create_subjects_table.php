<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('code');
            $table->unsignedInteger('duration_minutes');
            $table->unsignedTinyInteger('questions_per_page')->default(1); // 1, 2, 3, or 4
            $table->unsignedInteger('total_questions_to_display');         // Shown from pool
            $table->unsignedInteger('pass_mark')->default(50);
            $table->text('instructions')->nullable();
            $table->json('allocation_criteria')->nullable();               // {"department":"CS","level":"300"}
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->unique(['exam_season_id', 'code']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('subjects');
    }
};
