<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Book;
use App\Models\LibraryUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphQLLibraryUserTest extends TestCase
{
    use RefreshDatabase;

    public function test_library_users_query(): void
    {
        LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);

        $response = $this->postJson('/graphql', [
            'query' => '{ libraryUsers { id name surname email } }',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.libraryUsers.0.name', 'Ann');
        $response->assertJsonPath('data.libraryUsers.0.surname', 'Lee');
    }

    public function test_create_library_user_mutation(): void
    {
        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($name: String!, $surname: String!, $email: String!) {
                    createLibraryUser(name: $name, surname: $surname, email: $email) {
                        id name surname email
                    }
                }
                GQL,
            'variables' => [
                'name' => 'Bob',
                'surname' => 'Smith',
                'email' => 'bob@example.com',
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.createLibraryUser.email', 'bob@example.com');
        $this->assertDatabaseHas('library_users', ['email' => 'bob@example.com']);
    }

    public function test_set_book_library_user_mutation_assign_and_clear(): void
    {
        $patron = LibraryUser::query()->create([
            'name' => 'C',
            'surname' => 'D',
            'email' => 'cd@example.com',
        ]);
        $book = Book::query()->create(['title' => 'T', 'author' => 'A']);

        $assign = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!, $libraryUserId: ID) {
                    setBookLibraryUser(id: $id, libraryUserId: $libraryUserId) {
                        id
                        libraryUser { id }
                    }
                }
                GQL,
            'variables' => [
                'id' => (string) $book->id,
                'libraryUserId' => (string) $patron->id,
            ],
        ]);

        $assign->assertOk();
        $assign->assertJsonPath('data.setBookLibraryUser.libraryUser.id', (string) $patron->id);
        $this->assertDatabaseHas('books', ['id' => $book->id, 'library_user_id' => $patron->id]);

        $clear = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!, $libraryUserId: ID) {
                    setBookLibraryUser(id: $id, libraryUserId: $libraryUserId) {
                        id
                        libraryUser { id }
                    }
                }
                GQL,
            'variables' => [
                'id' => (string) $book->id,
                'libraryUserId' => null,
            ],
        ]);

        $clear->assertOk();
        $clear->assertJsonPath('data.setBookLibraryUser.id', (string) $book->id);
        $this->assertDatabaseHas('books', ['id' => $book->id, 'library_user_id' => null]);
    }

    public function test_books_query_includes_borrower_when_present(): void
    {
        $patron = LibraryUser::query()->create([
            'name' => 'E',
            'surname' => 'F',
            'email' => 'ef@example.com',
        ]);
        Book::query()->create([
            'title' => 'Owned',
            'author' => 'Auth',
            'library_user_id' => $patron->id,
        ]);

        $response = $this->postJson('/graphql', [
            'query' => '{ books { id title libraryUser { surname } } }',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.books.0.libraryUser.surname', 'F');
    }
}
