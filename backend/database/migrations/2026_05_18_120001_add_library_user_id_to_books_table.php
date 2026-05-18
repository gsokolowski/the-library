<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('books', static function (Blueprint $table): void {
            $table->foreignId('library_user_id')
                ->nullable()
                ->after('author')
                ->constrained('library_users')
                ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('books', static function (Blueprint $table): void {
            $table->dropForeign(['library_user_id']);
        });
    }
};
