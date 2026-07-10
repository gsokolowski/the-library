<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('book_waitlists', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('book_id')->constrained('books')->cascadeOnDelete();
            $table->foreignId('library_user_id')->constrained('library_users')->cascadeOnDelete();
            $table->string('status', 32)->default('waiting');
            $table->timestamp('notified_at')->nullable();
            $table->timestamp('fulfilled_at')->nullable();
            $table->timestamps();

            $table->unique(['book_id', 'library_user_id']);
            $table->index(['book_id', 'status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('book_waitlists');
    }
};
