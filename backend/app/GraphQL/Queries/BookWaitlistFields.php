<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Book;
use App\Models\BookWaitlist;

final class BookWaitlistFields
{
    public function waitlistCount(Book $book): int
    {
        return BookWaitlist::query()
            ->where('book_id', $book->id)
            ->where('status', BookWaitlist::STATUS_WAITING)
            ->count();
    }

    /**
     * @param  array{libraryUserId: string|int}  $args
     */
    public function onWaitlist(Book $book, array $args): bool
    {
        $libraryUserId = (int) $args['libraryUserId'];

        return BookWaitlist::query()
            ->where('book_id', $book->id)
            ->where('library_user_id', $libraryUserId)
            ->whereIn('status', BookWaitlist::ACTIVE_STATUSES)
            ->exists();
    }
}
