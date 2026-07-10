<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class LibraryUserNotification extends Model
{
    public const string TYPE_BOOK_AVAILABLE = 'book_available';

    protected $fillable = [
        'library_user_id',
        'type',
        'book_id',
        'title',
        'body',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    /** @return BelongsTo<LibraryUser, $this> */
    public function libraryUser(): BelongsTo
    {
        return $this->belongsTo(LibraryUser::class);
    }

    /** @return BelongsTo<Book, $this> */
    public function book(): BelongsTo
    {
        return $this->belongsTo(Book::class);
    }
}
