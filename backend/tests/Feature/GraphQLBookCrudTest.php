<?php

namespace Tests\Feature;

use App\Models\Book;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphQLBookCrudTest extends TestCase
{
    use RefreshDatabase;

    public function test_books_query_returns_seeded_books(): void
    {
        Book::query()->create(['title' => 'Alpha', 'author' => 'A']);

        $response = $this->postJson('/graphql', [
            'query' => '{ books { id title author } }',
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.books.0.title', 'Alpha');
    }

    public function test_book_query_returns_one_book_by_id(): void
    {
        $book = Book::query()->create(['title' => 'Solo', 'author' => 'S']);

        $response = $this->postJson('/graphql', [
            'query' => 'query($id: ID!) { book(id: $id) { id title author } }',
            'variables' => ['id' => (string) $book->id],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.book.title', 'Solo');
        $response->assertJsonPath('data.book.author', 'S');
    }

    public function test_create_book_mutation(): void
    {
        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($title: String!, $author: String!) {
                    createBook(title: $title, author: $author) {
                        id title author
                    }
                }
                GQL,
            'variables' => [
                'title' => 'New Title',
                'author' => 'New Author',
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.createBook.title', 'New Title');
        $this->assertDatabaseHas('books', ['title' => 'New Title', 'author' => 'New Author']);
    }

    public function test_update_book_mutation(): void
    {
        $book = Book::query()->create(['title' => 'Old', 'author' => 'O']);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!, $title: String!, $author: String!) {
                    updateBook(id: $id, title: $title, author: $author) {
                        id title author
                    }
                }
                GQL,
            'variables' => [
                'id' => (string) $book->id,
                'title' => 'Revised',
                'author' => 'R',
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.updateBook.title', 'Revised');
        $response->assertJsonPath('data.updateBook.author', 'R');
        $this->assertDatabaseHas('books', ['id' => $book->id, 'title' => 'Revised', 'author' => 'R']);
    }
}
