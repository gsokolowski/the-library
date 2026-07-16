<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('circulation_events', static function (Blueprint $table): void {
            $table->id();
            $table->string('kind', 32);
            $table->timestamp('occurred_at');
            $table->foreignId('book_id')->nullable()->constrained('books')->nullOnDelete();
            $table->string('book_title');
            $table->foreignId('library_user_id')->nullable()->constrained('library_users')->nullOnDelete();
            $table->string('patron_name')->nullable();
            $table->string('routing_key', 64)->nullable();
            $table->timestamps();

            $table->index(['occurred_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('circulation_events');
    }
};
