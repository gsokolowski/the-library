/** GraphQL query and mutation documents for the Library API. */

export const BOOKS_QUERY = `
    query {
        books {
            id
            title
            author
            waitlistCount
            libraryUser {
                id
                name
                surname
                email
            }
        }
    }
`;

export const BOOK_QUERY = `
    query Book($id: ID!) {
        book(id: $id) {
            id
            title
            author
            libraryUser {
                id
                name
                surname
                email
            }
            created_at
            updated_at
        }
    }
`;

export const CREATE_BOOK_MUTATION = `
    mutation ($title: String!, $author: String!) {
        createBook(title: $title, author: $author) {
            id
            title
            author
        }
    }
`;

export const UPDATE_BOOK_MUTATION = `
    mutation ($id: ID!, $title: String!, $author: String!) {
        updateBook(id: $id, title: $title, author: $author) {
            id
            title
            author
        }
    }
`;

export const DELETE_BOOK_MUTATION = `
    mutation ($id: ID!) {
        deleteBook(id: $id) {
            id
        }
    }
`;

export const LIBRARY_USERS_QUERY = `
    query {
        libraryUsers {
            id
            name
            surname
            email
        }
    }
`;

export const LIBRARY_USER_QUERY = `
    query LibraryUser($id: ID!) {
        libraryUser(id: $id) {
            id
            name
            surname
            email
            created_at
            updated_at
            books {
                id
                title
                author
            }
            waitlist {
                id
                status
                created_at
                book {
                    id
                    title
                    author
                    library_user_id
                }
            }
            notifications(unreadOnly: true) {
                id
                type
                title
                body
                read_at
                created_at
                book {
                    id
                    title
                }
            }
        }
    }
`;

export const CREATE_LIBRARY_USER_MUTATION = `
    mutation ($name: String!, $surname: String!, $email: String!) {
        createLibraryUser(name: $name, surname: $surname, email: $email) {
            id
            name
            surname
            email
        }
    }
`;

export const UPDATE_LIBRARY_USER_MUTATION = `
    mutation ($id: ID!, $name: String!, $surname: String!, $email: String!) {
        updateLibraryUser(id: $id, name: $name, surname: $surname, email: $email) {
            id
            name
            surname
            email
        }
    }
`;

export const DELETE_LIBRARY_USER_MUTATION = `
    mutation ($id: ID!) {
        deleteLibraryUser(id: $id) {
            id
        }
    }
`;

export const SET_BOOK_LIBRARY_USER_MUTATION = `
    mutation ($id: ID!, $libraryUserId: ID) {
        setBookLibraryUser(id: $id, libraryUserId: $libraryUserId) {
            id
            libraryUser {
                id
                name
                surname
            }
        }
    }
`;

export const JOIN_BOOK_WAITLIST_MUTATION = `
    mutation ($bookId: ID!, $libraryUserId: ID!) {
        joinBookWaitlist(bookId: $bookId, libraryUserId: $libraryUserId) {
            id
            status
            book { id title }
        }
    }
`;

export const LEAVE_BOOK_WAITLIST_MUTATION = `
    mutation ($bookId: ID!, $libraryUserId: ID!) {
        leaveBookWaitlist(bookId: $bookId, libraryUserId: $libraryUserId)
    }
`;

export const MARK_NOTIFICATIONS_READ_MUTATION = `
    mutation ($ids: [ID!]!) {
        markNotificationsRead(ids: $ids) {
            id
            read_at
        }
    }
`;

export const CIRCULATION_EVENTS_QUERY = `
    query CirculationEvents($limit: Int) {
        circulationEvents(limit: $limit) {
            id
            kind
            occurred_at
            book_title
            patron_name
            summary
        }
    }
`;
