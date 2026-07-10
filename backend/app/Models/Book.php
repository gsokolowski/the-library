<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Book extends Model
{
    protected $fillable = [
        'title',
        'author',
        'library_user_id',
    ];

    /** @return BelongsTo<LibraryUser, $this> */
    public function libraryUser(): BelongsTo
    {
        return $this->belongsTo(LibraryUser::class);
    }

    /** @return HasMany<BookWaitlist, $this> */
    public function waitlistEntries(): HasMany
    {
        return $this->hasMany(BookWaitlist::class);
    }
}
