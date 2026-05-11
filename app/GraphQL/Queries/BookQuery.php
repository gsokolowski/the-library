<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\Book;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Cache;

final class BookQuery
{
    public const string CACHE_KEY = 'graphql.books.all';

    /**
     * Cached book list (Redis when CACHE_STORE=redis).
     *
     * @return Collection<int, Book>
     */
    public function all(): Collection
    {
        /** @var Collection<int, Book> */
        return Cache::remember(self::CACHE_KEY, 60, function (): Collection {
            return Book::query()->orderBy('title')->get();
        });
    }
}
