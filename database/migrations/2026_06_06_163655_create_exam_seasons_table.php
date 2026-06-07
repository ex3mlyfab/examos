<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('exam_seasons', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('code')->unique();           // e.g. "2425S1"
            $table->text('description')->nullable();
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->unsignedInteger('logout_grace_minutes')->default(30);
            $table->enum('status', ['draft', 'active', 'completed'])->default('draft');
            $table->boolean('allow_result_review')->default(false);
            $table->foreignId('created_by')->constrained('users');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('exam_seasons');
    }
};
