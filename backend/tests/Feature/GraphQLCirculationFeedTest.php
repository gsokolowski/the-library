<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Book;
use App\Models\CirculationEvent;
use App\Models\LibraryUser;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphQLCirculationFeedTest extends TestCase
{
    use RefreshDatabase;

    public function test_borrow_and_return_append_circulation_events_when_rabbitmq_disabled(): void
    {
        $patron = LibraryUser::query()->create([
            'name' => 'Jane',
            'surname' => 'Doe',
            'email' => 'jane@example.com',
        ]);
        $book = Book::query()->create([
            'title' => 'Dune',
            'author' => 'Herbert',
        ]);

        $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!, $libraryUserId: ID) {
                    setBookLibraryUser(id: $id, libraryUserId: $libraryUserId) { id }
                }
                GQL,
            'variables' => [
                'id' => (string) $book->id,
                'libraryUserId' => (string) $patron->id,
            ],
        ])->assertOk();

        $this->assertDatabaseHas('circulation_events', [
            'kind' => CirculationEvent::KIND_BORROW,
            'book_id' => $book->id,
            'book_title' => 'Dune',
            'library_user_id' => $patron->id,
            'patron_name' => 'Jane Doe',
        ]);

        $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!, $libraryUserId: ID) {
                    setBookLibraryUser(id: $id, libraryUserId: $libraryUserId) { id }
                }
                GQL,
            'variables' => [
                'id' => (string) $book->id,
                'libraryUserId' => null,
            ],
        ])->assertOk();

        $this->assertDatabaseHas('circulation_events', [
            'kind' => CirculationEvent::KIND_RETURN,
            'book_id' => $book->id,
            'book_title' => 'Dune',
            'library_user_id' => $patron->id,
            'patron_name' => 'Jane Doe',
        ]);

        $this->assertSame(2, CirculationEvent::query()->count());
    }

    public function test_circulation_events_query_returns_newest_first_with_summary(): void
    {
        $patron = LibraryUser::query()->create([
            'name' => 'Jane',
            'surname' => 'Doe',
            'email' => 'jane@example.com',
        ]);
        $book = Book::query()->create([
            'title' => 'Dune',
            'author' => 'Herbert',
            'library_user_id' => $patron->id,
        ]);

        CirculationEvent::query()->create([
            'kind' => CirculationEvent::KIND_BORROW,
            'occurred_at' => now()->subMinutes(10),
            'book_id' => $book->id,
            'book_title' => 'Dune',
            'library_user_id' => $patron->id,
            'patron_name' => 'Jane Doe',
            'routing_key' => 'book.borrowed',
        ]);
        CirculationEvent::query()->create([
            'kind' => CirculationEvent::KIND_RETURN,
            'occurred_at' => now()->subMinutes(5),
            'book_id' => $book->id,
            'book_title' => 'Dune',
            'library_user_id' => $patron->id,
            'patron_name' => 'Jane Doe',
            'routing_key' => 'book.returned',
        ]);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                query {
                    circulationEvents(limit: 10) {
                        id
                        kind
                        book_title
                        patron_name
                        summary
                    }
                }
                GQL,
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.circulationEvents.0.kind', CirculationEvent::KIND_RETURN);
        $response->assertJsonPath('data.circulationEvents.1.kind', CirculationEvent::KIND_BORROW);
        $this->assertStringContainsString('returned Dune', (string) $response->json('data.circulationEvents.0.summary'));
        $this->assertStringContainsString('Jane Doe borrowed Dune', (string) $response->json('data.circulationEvents.1.summary'));
    }

    public function test_circulation_events_limit_is_clamped(): void
    {
        $patron = LibraryUser::query()->create([
            'name' => 'A',
            'surname' => 'B',
            'email' => 'ab@example.com',
        ]);
        $book = Book::query()->create([
            'title' => 'Book',
            'author' => 'Author',
        ]);

        for ($i = 0; $i < 5; $i++) {
            CirculationEvent::query()->create([
                'kind' => CirculationEvent::KIND_BORROW,
                'occurred_at' => now()->subMinutes($i),
                'book_id' => $book->id,
                'book_title' => 'Book',
                'library_user_id' => $patron->id,
                'patron_name' => 'A B',
                'routing_key' => 'book.borrowed',
            ]);
        }

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                query {
                    circulationEvents(limit: 2) {
                        id
                    }
                }
                GQL,
        ]);

        $response->assertOk();
        $this->assertCount(2, $response->json('data.circulationEvents'));
    }
}
