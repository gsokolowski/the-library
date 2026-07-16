<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\CirculationEvent;
use Illuminate\Database\Eloquent\Collection;

final class CirculationEventsQuery
{
    private const int DEFAULT_LIMIT = 30;

    private const int MAX_LIMIT = 50;

    /**
     * @param  array{limit?: int|null}  $args
     * @return Collection<int, CirculationEvent>
     */
    public function __invoke(mixed $_, array $args): Collection
    {
        $limit = (int) ($args['limit'] ?? self::DEFAULT_LIMIT);
        $limit = max(1, min($limit, self::MAX_LIMIT));

        return CirculationEvent::query()
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->limit($limit)
            ->get();
    }
}
