<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('subject_id')->constrained()->onDelete('cascade');
            $table->text('question_text');
            $table->enum('question_type', ['single_choice', 'multi_choice', 'true_false'])
                  ->default('single_choice');
            $table->string('image_path')->nullable();
            $table->unsignedInteger('marks')->default(1);
            $table->boolean('is_active')->default(true);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['subject_id', 'is_active']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('questions');
    }
};
