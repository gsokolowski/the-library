<?php

declare(strict_types=1);

namespace App\GraphQL\Mutations;

use App\Models\LibraryUserNotification;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Validator;
use GraphQL\Error\UserError;

final class MarkNotificationsRead
{
    /**
     * @return Collection<int, LibraryUserNotification>
     */
    public function __invoke(mixed $_, array $args): Collection
    {
        $validated = Validator::make(
            ['ids' => $args['ids'] ?? []],
            [
                'ids' => ['required', 'array', 'min:1'],
                'ids.*' => ['integer', 'exists:library_user_notifications,id'],
            ],
        );

        if ($validated->fails()) {
            throw new UserError($validated->errors()->first() ?? 'Invalid notification ids.');
        }

        $ids = array_map(static fn (mixed $id): int => (int) $id, $validated->validated()['ids']);

        $notifications = LibraryUserNotification::query()
            ->whereIn('id', $ids)
            ->get();

        $now = now();

        foreach ($notifications as $notification) {
            if ($notification->read_at === null) {
                $notification->update(['read_at' => $now]);
            }
        }

        return LibraryUserNotification::query()
            ->whereIn('id', $ids)
            ->get();
    }
}
