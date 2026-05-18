<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\Book;

final class SetBookLibraryUser
{
    /**
     * Assign a book to a library patron, or pass null for `libraryUserId` to mark it as returned / on shelf.
     */
    public function __invoke(mixed $_, array $args): Book
    {
        $book = Book::query()->findOrFail($args['id']);

        if (array_key_exists('libraryUserId', $args)) {
            $raw = $args['libraryUserId'];
            $book->library_user_id = $raw !== null && $raw !== '' ? (int) $raw : null;
            $book->save();
        }

        return $book->fresh(['libraryUser']);
    }
}
