<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('library_user_notifications', static function (Blueprint $table): void {
            $table->id();
            $table->foreignId('library_user_id')->constrained('library_users')->cascadeOnDelete();
            $table->string('type', 64);
            $table->foreignId('book_id')->nullable()->constrained('books')->nullOnDelete();
            $table->string('title');
            $table->text('body');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('library_user_notifications');
    }
};
