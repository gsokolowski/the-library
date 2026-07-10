<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Book;
use App\Models\BookWaitlist;
use App\Models\LibraryUser;
use GraphQL\Error\UserError;
use Illuminate\Support\Facades\DB;

final class JoinBookWaitlist
{
    public function __invoke(mixed $_, array $args): BookWaitlist
    {
        $bookId = (int) $args['bookId'];
        $libraryUserId = (int) $args['libraryUserId'];

        $book = Book::query()->find($bookId);
        if ($book === null) {
            throw new UserError('Book not found.');
        }

        if ($book->library_user_id === null) {
            throw new UserError('This book is on the shelf — borrow it directly instead of joining the waitlist.');
        }

        if ((int) $book->library_user_id === $libraryUserId) {
            throw new UserError('You already have this book checked out.');
        }

        LibraryUser::query()->findOrFail($libraryUserId);

        $existing = BookWaitlist::query()
            ->where('book_id', $bookId)
            ->where('library_user_id', $libraryUserId)
            ->whereIn('status', BookWaitlist::ACTIVE_STATUSES)
            ->first();

        if ($existing !== null) {
            throw new UserError('This library user is already on the waitlist for this book.');
        }

        return DB::transaction(function () use ($bookId, $libraryUserId): BookWaitlist {
            BookWaitlist::query()
                ->where('book_id', $bookId)
                ->where('library_user_id', $libraryUserId)
                ->where('status', BookWaitlist::STATUS_CANCELLED)
                ->delete();

            return BookWaitlist::query()->create([
                'book_id' => $bookId,
                'library_user_id' => $libraryUserId,
                'status' => BookWaitlist::STATUS_WAITING,
            ]);
        });
    }
}
