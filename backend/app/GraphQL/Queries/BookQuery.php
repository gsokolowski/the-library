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
     * Redis payloads are plain attribute rows (arrays), then re-hydrated with {@see Book::hydrate}.
     * Caching serialized {@see Collection} or {@see Book} instances in Redis can yield
     * `__PHP_Incomplete_Class` on read after deploys / PHP churn.
     *
     * @return Collection<int, Book>
     */
    public function all(): Collection
    {
        /** @var array<int, array<string, mixed>> $rows */
        $rows = Cache::remember(self::CACHE_KEY, 60, function (): array {
            return Book::query()
                ->orderBy('title')
                ->get()
                ->map(static fn (Book $book): array => $book->getAttributes())
                ->all();
        });

        return Book::hydrate($rows);
    }
}
