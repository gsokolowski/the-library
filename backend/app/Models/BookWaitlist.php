<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BookWaitlist extends Model
{
    public const string STATUS_WAITING = 'waiting';

    public const string STATUS_NOTIFIED = 'notified';

    public const string STATUS_FULFILLED = 'fulfilled';

    public const string STATUS_CANCELLED = 'cancelled';

    /** @var list<string> */
    public const array ACTIVE_STATUSES = [
        self::STATUS_WAITING,
        self::STATUS_NOTIFIED,
    ];

    protected $fillable = [
        'book_id',
        'library_user_id',
        'status',
        'notified_at',
        'fulfilled_at',
    ];

    protected function casts(): array
    {
        return [
            'notified_at' => 'datetime',
            'fulfilled_at' => 'datetime',
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
}
