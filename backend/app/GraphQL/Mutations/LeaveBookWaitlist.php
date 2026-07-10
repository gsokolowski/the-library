<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\BookWaitlist;
use GraphQL\Error\UserError;

final class LeaveBookWaitlist
{
    public function __invoke(mixed $_, array $args): bool
    {
        $bookId = (int) $args['bookId'];
        $libraryUserId = (int) $args['libraryUserId'];

        $entry = BookWaitlist::query()
            ->where('book_id', $bookId)
            ->where('library_user_id', $libraryUserId)
            ->whereIn('status', BookWaitlist::ACTIVE_STATUSES)
            ->first();

        if ($entry === null) {
            throw new UserError('No active waitlist entry found for this book and library user.');
        }

        $entry->update(['status' => BookWaitlist::STATUS_CANCELLED]);

        return true;
    }
}
