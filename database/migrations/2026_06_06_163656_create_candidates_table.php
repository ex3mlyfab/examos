<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('file_no')->unique();            // Login username
            $table->string('name');
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('gender')->nullable();
            $table->string('department')->nullable();
            $table->string('level')->nullable();
            $table->string('photo')->nullable();
            $table->string('password');                     // Hashed
            $table->string('raw_password')->nullable();     // Plain text — purge after credential print
            $table->foreignId('exam_season_id')->constrained()->onDelete('cascade');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
            $table->index(['file_no', 'exam_season_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
};
