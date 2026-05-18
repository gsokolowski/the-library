<?php

declare(strict_types=1);

namespace App\GraphQL\Validators;

use Illuminate\Validation\Rule;
use Nuwave\Lighthouse\Validation\Validator;

final class UpdateLibraryUserValidator extends Validator
{
    /** @return array<string, list<string|\Illuminate\Validation\Rules\Unique>> */
    public function rules(): array
    {
        $id = $this->arg('id');

        return [
            'id' => ['required', 'integer', 'exists:library_users,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'surname' => ['sometimes', 'string', 'max:255'],
            'email' => [
                'sometimes',
                'email',
                'max:255',
                Rule::unique('library_users', 'email')->ignore($id, 'id'),
            ],
        ];
    }
}
