<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Book;
use App\Models\BookWaitlist;
use App\Models\LibraryUser;
use App\Models\LibraryUserNotification;
use Illuminate\Database\Eloquent\Collection;

final class LibraryUserFields
{
    /**
     * @return Collection<int, BookWaitlist>
     */
    public function waitlist(LibraryUser $libraryUser): Collection
    {
        return $libraryUser->waitlistEntries()->with('book')->get();
    }

    /**
     * @param  array{unreadOnly?: bool|null}  $args
     * @return Collection<int, LibraryUserNotification>
     */
    public function notifications(LibraryUser $libraryUser, array $args): Collection
    {
        $query = $libraryUser->notifications()->with('book');

        if (! empty($args['unreadOnly'])) {
            $query->whereNull('read_at');
        }

        return $query->get();
    }
}
