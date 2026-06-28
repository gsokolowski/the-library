<?php

declare(strict_types=1);

namespace App\Observers;

use App\GraphQL\Queries\BookQuery;
use App\Models\Book;
use App\Services\RabbitMqPublisher;
use Illuminate\Support\Facades\Cache;

final class BookObserver
{
    public function created(Book $book): void
    {
        $this->publisher()->publish('book.created', $this->payload($book));
        Cache::forget(BookQuery::CACHE_KEY);
    }

    public function updated(Book $book): void
    {
        $this->publisher()->publish('book.updated', $this->payload($book));

        if ($book->wasChanged('library_user_id')) {
            $previousId = $book->getOriginal('library_user_id');
            $currentId = $book->library_user_id;

            if ($currentId !== null) {
                $borrowPayload = $this->payload($book);
                if ($previousId !== null && (int) $previousId !== (int) $currentId) {
                    $borrowPayload['previous_library_user_id'] = (int) $previousId;
                }
                $this->publisher()->publish('book.borrowed', $borrowPayload);
            } elseif ($previousId !== null) {
                $this->publisher()->publish('book.returned', [
                    'id' => $book->id,
                    'previous_library_user_id' => (int) $previousId,
                    'returned_at' => now()->toIso8601String(),
                ]);
            }
        }

        Cache::forget(BookQuery::CACHE_KEY);
    }

    public function deleted(Book $book): void
    {
        $this->publisher()->publish('book.deleted', [
            'id' => $book->id,
            'deleted_at' => now()->toIso8601String(),
        ]);
        Cache::forget(BookQuery::CACHE_KEY);
    }

    /** @return array<string, mixed> */
    private function payload(Book $book): array
    {
        return [
            'id' => $book->id,
            'title' => $book->title,
            'author' => $book->author,
            'library_user_id' => $book->library_user_id,
            'updated_at' => $book->updated_at?->toIso8601String(),
        ];
    }

    private function publisher(): RabbitMqPublisher
    {
        return app(RabbitMqPublisher::class);
    }
}
