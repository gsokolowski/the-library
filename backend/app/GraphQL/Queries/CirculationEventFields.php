<?php

declare(strict_types=1);

namespace App\GraphQL\Queries;

use App\Models\CirculationEvent;

final class CirculationEventFields
{
    public function summary(CirculationEvent $event): string
    {
        return $event->summary();
    }
}
