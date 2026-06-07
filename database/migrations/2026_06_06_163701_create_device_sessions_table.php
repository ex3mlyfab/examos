<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('device_sessions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            $table->string('device_fingerprint');            // SHA-256 hash of UA + IP + Language
            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();
            $table->timestamp('last_active_at')->useCurrent();
            $table->boolean('is_locked')->default(true);     // False = admin released it
            $table->timestamps();
            $table->index('device_fingerprint');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('device_sessions');
    }
};
