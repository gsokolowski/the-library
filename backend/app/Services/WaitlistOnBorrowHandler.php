<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\BookWaitlist;
use Illuminate\Support\Facades\DB;

final class WaitlistOnBorrowHandler
{
    public function handle(int $bookId, int $libraryUserId): void
    {
        DB::transaction(function () use ($bookId, $libraryUserId): void {
            BookWaitlist::query()
                ->where('book_id', $bookId)
                ->where('library_user_id', $libraryUserId)
                ->whereIn('status', BookWaitlist::ACTIVE_STATUSES)
                ->lockForUpdate()
                ->update([
                    'status' => BookWaitlist::STATUS_FULFILLED,
                    'fulfilled_at' => now(),
                ]);
        });
    }
}
