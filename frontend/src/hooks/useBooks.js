import { useCallback, useEffect, useState } from 'react';
import { graphqlRequest } from '../graphqlClient.js';
import {
    BOOK_QUERY,
    CREATE_BOOK_MUTATION,
    DELETE_BOOK_MUTATION,
    UPDATE_BOOK_MUTATION,
    BOOKS_QUERY,
} from '../queries.js';

/**
 * @param {React.Dispatch<React.SetStateAction<string | null>>} setError
 */
export function useBooks(setError) {
    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [savingBook, setSavingBook] = useState(false);

    const [viewingBookId, setViewingBookId] = useState(null);
    const [detailBook, setDetailBook] = useState(null);
    const [detailBookLoading, setDetailBookLoading] = useState(false);
    const [detailBookError, setDetailBookError] = useState(null);

    const [editingBookId, setEditingBookId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [updateBookSaving, setUpdateBookSaving] = useState(false);

    const loadBooks = useCallback(async () => {
        setError(null);
        setBooksLoading(true);
        try {
            const data = await graphqlRequest(BOOKS_QUERY);
            setBooks(data.books ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setBooks([]);
        } finally {
            setBooksLoading(false);
        }
    }, [setError]);

    useEffect(() => {
        void loadBooks();
    }, [loadBooks]);

    function closeBookDetail() {
        setViewingBookId(null);
        setDetailBook(null);
        setDetailBookLoading(false);
        setDetailBookError(null);
    }

    function closeBookEdit() {
        setEditingBookId(null);
        setEditTitle('');
        setEditAuthor('');
        setUpdateBookSaving(false);
    }

    async function handleCreateBook(e) {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            return;
        }
        setSavingBook(true);
        setError(null);
        try {
            await graphqlRequest(CREATE_BOOK_MUTATION, {
                title: title.trim(),
                author: author.trim(),
            });
            setTitle('');
            setAuthor('');
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create book');
        } finally {
            setSavingBook(false);
        }
    }

    async function handleDeleteBook(id) {
        setError(null);
        try {
            await graphqlRequest(DELETE_BOOK_MUTATION, { id: String(id) });
            if (viewingBookId === String(id)) {
                closeBookDetail();
            }
            if (editingBookId === String(id)) {
                closeBookEdit();
            }
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete book');
        }
    }

    async function handleViewBook(id) {
        const sid = String(id);
        setViewingBookId(sid);
        setDetailBook(null);
        setDetailBookLoading(true);
        setDetailBookError(null);
        try {
            const data = await graphqlRequest(BOOK_QUERY, { id: sid });
            setDetailBook(data.book ?? null);
        } catch (err) {
            setDetailBookError(err instanceof Error ? err.message : 'Could not load book');
            setDetailBook(null);
        } finally {
            setDetailBookLoading(false);
        }
    }

    function handleEditBookOpen(b) {
        setEditingBookId(String(b.id));
        setEditTitle(b.title);
        setEditAuthor(b.author);
        setError(null);
    }

    async function handleUpdateBook(e) {
        e.preventDefault();
        if (!editingBookId || !editTitle.trim() || !editAuthor.trim()) {
            return;
        }
        setUpdateBookSaving(true);
        setError(null);
        try {
            await graphqlRequest(UPDATE_BOOK_MUTATION, {
                id: editingBookId,
                title: editTitle.trim(),
                author: editAuthor.trim(),
            });
            await loadBooks();
            if (viewingBookId === editingBookId) {
                void handleViewBook(editingBookId);
            }
            closeBookEdit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update book');
        } finally {
            setUpdateBookSaving(false);
        }
    }

    return {
        books,
        booksLoading,
        title,
        author,
        savingBook,
        setTitle,
        setAuthor,
        viewingBookId,
        detailBook,
        detailBookLoading,
        detailBookError,
        editingBookId,
        editTitle,
        editAuthor,
        updateBookSaving,
        setEditTitle,
        setEditAuthor,
        loadBooks,
        closeBookDetail,
        closeBookEdit,
        handleCreateBook,
        handleDeleteBook,
        handleViewBook,
        handleEditBookOpen,
        handleUpdateBook,
    };
}
