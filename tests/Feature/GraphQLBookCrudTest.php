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
}
