/** GraphQL query and mutation documents for the Library API. */

export const BOOKS_QUERY = `
    query {
        books {
            id
            title
            author
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
