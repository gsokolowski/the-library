<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CirculationEvent extends Model
{
    public const string KIND_BORROW = 'borrow';

    public const string KIND_RETURN = 'return';

    protected $fillable = [
        'kind',
        'occurred_at',
        'book_id',
        'book_title',
        'library_user_id',
        'patron_name',
        'routing_key',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<Book, $this> */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }

    /** @return BelongsTo<LibraryUser, $this> */
    public function libraryUser(): BelongsTo
    {
        return $this->belongsTo(LibraryUser::class);
    }

    public function summary(): string
    {
        $time = $this->occurred_at?->format('H:i') ?? '??:??';
        $title = $this->book_title;
        $patron = $this->patron_name ?: 'Someone';

        return match ($this->kind) {
            self::KIND_BORROW => sprintf('At %s, %s borrowed %s', $time, $patron, $title),
            self::KIND_RETURN => sprintf('At %s, %s returned %s', $time, $patron, $title),
            default => sprintf('At %s, %s — %s', $time, $patron, $title),
        };
    }
}
