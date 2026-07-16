<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\CirculationEvent;
use Carbon\CarbonInterface;

final class CirculationFeedHandler
{
    public const int MAX_ROWS = 200;

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handleBorrowed(array $payload): void
    {
        $this->append(
            kind: CirculationEvent::KIND_BORROW,
            routingKey: 'book.borrowed',
            bookId: isset($payload['id']) ? (int) $payload['id'] : null,
            bookTitle: (string) ($payload['title'] ?? 'Unknown title'),
            libraryUserId: isset($payload['library_user_id']) ? (int) $payload['library_user_id'] : null,
            patronName: isset($payload['patron_name']) ? (string) $payload['patron_name'] : null,
            occurredAt: $this->occurredAt($payload, 'borrowed_at', 'updated_at'),
        );
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    public function handleReturned(array $payload): void
    {
        $libraryUserId = $payload['previous_library_user_id'] ?? $payload['library_user_id'] ?? null;

        $this->append(
            kind: CirculationEvent::KIND_RETURN,
            routingKey: 'book.returned',
            bookId: isset($payload['id']) ? (int) $payload['id'] : null,
            bookTitle: (string) ($payload['title'] ?? 'Unknown title'),
            libraryUserId: $libraryUserId !== null ? (int) $libraryUserId : null,
            patronName: isset($payload['patron_name']) ? (string) $payload['patron_name'] : null,
            occurredAt: $this->occurredAt($payload, 'returned_at', 'updated_at'),
        );
    }

    private function append(
        string $kind,
        string $routingKey,
        ?int $bookId,
        string $bookTitle,
        ?int $libraryUserId,
        ?string $patronName,
        CarbonInterface $occurredAt,
    ): void {
        CirculationEvent::query()->create([
            'kind' => $kind,
            'occurred_at' => $occurredAt,
            'book_id' => $bookId,
            'book_title' => $bookTitle,
            'library_user_id' => $libraryUserId,
            'patron_name' => $patronName,
            'routing_key' => $routingKey,
        ]);

        $this->prune();
    }

    private function prune(): void
    {
        $keepIds = CirculationEvent::query()
            ->orderByDesc('id')
            ->limit(self::MAX_ROWS)
            ->pluck('id');

        if ($keepIds->isEmpty()) {
            return;
        }

        CirculationEvent::query()
            ->whereNotIn('id', $keepIds)
            ->delete();
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function occurredAt(array $payload, string ...$keys): CarbonInterface
    {
        foreach ($keys as $key) {
            if (! empty($payload[$key]) && is_string($payload[$key])) {
                return \Illuminate\Support\Carbon::parse($payload[$key]);
            }
        }

        return now();
    }
}
