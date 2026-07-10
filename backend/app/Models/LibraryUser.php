<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LibraryUser extends Model
{
    protected $table = 'library_users';

    protected $fillable = [
        'name',
        'surname',
        'email',
    ];

    /** @return HasMany<Book, $this> */
    public function books(): HasMany
    {
        return $this->hasMany(Book::class);
    }

    /** @return HasMany<BookWaitlist, $this> */
    public function waitlistEntries(): HasMany
    {
        return $this->hasMany(BookWaitlist::class)
            ->whereIn('status', BookWaitlist::ACTIVE_STATUSES)
            ->orderBy('created_at');
    }

    /** @return HasMany<LibraryUserNotification, $this> */
    public function notifications(): HasMany
    {
        return $this->hasMany(LibraryUserNotification::class)->orderByDesc('created_at');
    }
}
