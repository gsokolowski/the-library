<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Book;
use App\Models\BookWaitlist;
use App\Models\LibraryUser;
use App\Models\LibraryUserNotification;
use App\Services\WaitlistOnReturnHandler;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class GraphQLWaitlistTest extends TestCase
{
    use RefreshDatabase;

    public function test_join_waitlist_for_borrowed_book(): void
    {
        $borrower = LibraryUser::query()->create([
            'name' => 'Bob',
            'surname' => 'Jones',
            'email' => 'bob@example.com',
        ]);
        $waiter = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $book = Book::query()->create([
            'title' => 'Dune',
            'author' => 'Herbert',
            'library_user_id' => $borrower->id,
        ]);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($bookId: ID!, $libraryUserId: ID!) {
                    joinBookWaitlist(bookId: $bookId, libraryUserId: $libraryUserId) {
                        id status book { id title }
                    }
                }
                GQL,
            'variables' => [
                'bookId' => (string) $book->id,
                'libraryUserId' => (string) $waiter->id,
            ],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.joinBookWaitlist.status', 'waiting');
        $this->assertDatabaseHas('book_waitlists', [
            'book_id' => $book->id,
            'library_user_id' => $waiter->id,
            'status' => 'waiting',
        ]);
    }

    public function test_cannot_join_waitlist_when_book_on_shelf(): void
    {
        $waiter = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $book = Book::query()->create(['title' => 'Dune', 'author' => 'Herbert']);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($bookId: ID!, $libraryUserId: ID!) {
                    joinBookWaitlist(bookId: $bookId, libraryUserId: $libraryUserId) { id }
                }
                GQL,
            'variables' => [
                'bookId' => (string) $book->id,
                'libraryUserId' => (string) $waiter->id,
            ],
        ]);

        $response->assertOk();
        $response->assertJsonStructure(['errors']);
    }

    public function test_return_creates_notification_for_first_waiter_when_rabbitmq_disabled(): void
    {
        $borrower = LibraryUser::query()->create([
            'name' => 'Bob',
            'surname' => 'Jones',
            'email' => 'bob@example.com',
        ]);
        $first = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $second = LibraryUser::query()->create([
            'name' => 'Cal',
            'surname' => 'Wu',
            'email' => 'cal@example.com',
        ]);
        $book = Book::query()->create([
            'title' => 'Dune',
            'author' => 'Herbert',
            'library_user_id' => $borrower->id,
        ]);

        BookWaitlist::query()->create([
            'book_id' => $book->id,
            'library_user_id' => $first->id,
            'status' => BookWaitlist::STATUS_WAITING,
        ]);
        BookWaitlist::query()->create([
            'book_id' => $book->id,
            'library_user_id' => $second->id,
            'status' => BookWaitlist::STATUS_WAITING,
        ]);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($id: ID!) {
                    setBookLibraryUser(id: $id, libraryUserId: null) { id }
                }
                GQL,
            'variables' => ['id' => (string) $book->id],
        ]);

        $response->assertOk();

        $this->assertDatabaseHas('library_user_notifications', [
            'library_user_id' => $first->id,
            'book_id' => $book->id,
            'type' => LibraryUserNotification::TYPE_BOOK_AVAILABLE,
            'title' => 'Your reserved book is back',
        ]);
        $this->assertDatabaseMissing('library_user_notifications', [
            'library_user_id' => $second->id,
            'book_id' => $book->id,
        ]);
        $this->assertDatabaseHas('book_waitlists', [
            'library_user_id' => $first->id,
            'status' => BookWaitlist::STATUS_NOTIFIED,
        ]);
        $this->assertDatabaseHas('book_waitlists', [
            'library_user_id' => $second->id,
            'status' => BookWaitlist::STATUS_WAITING,
        ]);
    }

    public function test_waitlist_on_return_handler_is_idempotent(): void
    {
        $waiter = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $book = Book::query()->create(['title' => 'Dune', 'author' => 'Herbert']);
        BookWaitlist::query()->create([
            'book_id' => $book->id,
            'library_user_id' => $waiter->id,
            'status' => BookWaitlist::STATUS_WAITING,
        ]);

        $handler = app(WaitlistOnReturnHandler::class);
        $handler->handle((int) $book->id);
        $handler->handle((int) $book->id);

        $this->assertSame(
            1,
            LibraryUserNotification::query()
                ->where('library_user_id', $waiter->id)
                ->where('book_id', $book->id)
                ->count(),
        );
    }

    public function test_library_user_notifications_query(): void
    {
        $libraryUser = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $book = Book::query()->create(['title' => 'Dune', 'author' => 'Herbert']);

        LibraryUserNotification::query()->create([
            'library_user_id' => $libraryUser->id,
            'type' => LibraryUserNotification::TYPE_BOOK_AVAILABLE,
            'book_id' => $book->id,
            'title' => 'Your reserved book is back',
            'body' => '"Dune" by Herbert is on the shelf.',
        ]);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                query($id: ID!) {
                    libraryUser(id: $id) {
                        notifications(unreadOnly: true) {
                            id title body book { title }
                        }
                    }
                }
                GQL,
            'variables' => ['id' => (string) $libraryUser->id],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.libraryUser.notifications.0.title', 'Your reserved book is back');
        $response->assertJsonPath('data.libraryUser.notifications.0.book.title', 'Dune');
    }

    public function test_mark_notifications_read(): void
    {
        $libraryUser = LibraryUser::query()->create([
            'name' => 'Ann',
            'surname' => 'Lee',
            'email' => 'ann@example.com',
        ]);
        $notification = LibraryUserNotification::query()->create([
            'library_user_id' => $libraryUser->id,
            'type' => LibraryUserNotification::TYPE_BOOK_AVAILABLE,
            'title' => 'Ping',
            'body' => 'Body',
        ]);

        $response = $this->postJson('/graphql', [
            'query' => <<<'GQL'
                mutation($ids: [ID!]!) {
                    markNotificationsRead(ids: $ids) { id read_at }
                }
                GQL,
            'variables' => ['ids' => [(string) $notification->id]],
        ]);

        $response->assertOk();
        $response->assertJsonPath('data.markNotificationsRead.0.id', (string) $notification->id);
        $this->assertNotNull($notification->fresh()?->read_at);
    }
}
