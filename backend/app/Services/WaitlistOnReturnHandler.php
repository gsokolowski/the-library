<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Book;
use App\Models\BookWaitlist;
use App\Models\LibraryUserNotification;
use Illuminate\Support\Facades\DB;

final class WaitlistOnReturnHandler
{
    public function handle(int $bookId): void
    {
        DB::transaction(function () use ($bookId): void {
            $book = Book::query()->lockForUpdate()->find($bookId);

            if ($book === null || $book->library_user_id !== null) {
                return;
            }

            $entry = BookWaitlist::query()
                ->where('book_id', $bookId)
                ->where('status', BookWaitlist::STATUS_WAITING)
                ->orderBy('created_at')
                ->lockForUpdate()
                ->first();

            if ($entry === null) {
                return;
            }

            $alreadyNotified = LibraryUserNotification::query()
                ->where('library_user_id', $entry->library_user_id)
                ->where('book_id', $bookId)
                ->where('type', LibraryUserNotification::TYPE_BOOK_AVAILABLE)
                ->where('created_at', '>=', $entry->created_at)
                ->exists();

            if ($alreadyNotified) {
                $entry->update([
                    'status' => BookWaitlist::STATUS_NOTIFIED,
                    'notified_at' => $entry->notified_at ?? now(),
                ]);

                return;
            }

            LibraryUserNotification::query()->create([
                'library_user_id' => $entry->library_user_id,
                'type' => LibraryUserNotification::TYPE_BOOK_AVAILABLE,
                'book_id' => $bookId,
                'title' => 'Your reserved book is back',
                'body' => sprintf('"%s" by %s is on the shelf.', $book->title, $book->author),
            ]);

            $entry->update([
                'status' => BookWaitlist::STATUS_NOTIFIED,
                'notified_at' => now(),
            ]);
        });
    }
}
