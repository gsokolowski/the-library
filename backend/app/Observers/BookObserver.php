<?php

declare(strict_types=1);

namespace App\Observers;

use App\GraphQL\Queries\BookQuery;
use App\Models\Book;
use App\Models\LibraryUser;
use App\Services\CirculationFeedHandler;
use App\Services\RabbitMqPublisher;
use App\Services\WaitlistOnBorrowHandler;
use App\Services\WaitlistOnReturnHandler;
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
                $borrowPayload['patron_name'] = $this->patronName((int) $currentId);
                $borrowPayload['borrowed_at'] = now()->toIso8601String();
                if ($previousId !== null && (int) $previousId !== (int) $currentId) {
                    $borrowPayload['previous_library_user_id'] = (int) $previousId;
                }
                $this->publisher()->publish('book.borrowed', $borrowPayload);
                if (! $this->rabbitMqEnabled()) {
                    app(WaitlistOnBorrowHandler::class)->handle((int) $book->id, (int) $currentId);
                    app(CirculationFeedHandler::class)->handleBorrowed($borrowPayload);
                }
            } elseif ($previousId !== null) {
                $returnPayload = [
                    'id' => $book->id,
                    'title' => $book->title,
                    'previous_library_user_id' => (int) $previousId,
                    'patron_name' => $this->patronName((int) $previousId),
                    'returned_at' => now()->toIso8601String(),
                ];
                $this->publisher()->publish('book.returned', $returnPayload);
                if (! $this->rabbitMqEnabled()) {
                    app(WaitlistOnReturnHandler::class)->handle((int) $book->id);
                    app(CirculationFeedHandler::class)->handleReturned($returnPayload);
                }
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

    private function patronName(int $libraryUserId): ?string
    {
        $user = LibraryUser::query()->find($libraryUserId);
        if ($user === null) {
            return null;
        }

        return trim($user->name.' '.$user->surname);
    }

    private function publisher(): RabbitMqPublisher
    {
        return app(RabbitMqPublisher::class);
    }

    private function rabbitMqEnabled(): bool
    {
        return (bool) config('rabbitmq.enabled', false);
    }
}
