<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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
}
