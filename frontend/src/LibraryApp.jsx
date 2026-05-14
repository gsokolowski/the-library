import { useCallback, useEffect, useState } from 'react';
import { graphqlRequest } from './graphqlClient.js';

const BOOKS_QUERY = `
    query {
        books {
            id
            title
            author
        }
    }
`;

const BOOK_QUERY = `
    query Book($id: ID!) {
        book(id: $id) {
            id
            title
            author
            created_at
            updated_at
        }
    }
`;

const CREATE_MUTATION = `
    mutation ($title: String!, $author: String!) {
        createBook(title: $title, author: $author) {
            id
            title
            author
        }
    }
`;

const UPDATE_MUTATION = `
    mutation ($id: ID!, $title: String!, $author: String!) {
        updateBook(id: $id, title: $title, author: $author) {
            id
            title
            author
        }
    }
`;

const DELETE_MUTATION = `
    mutation ($id: ID!) {
        deleteBook(id: $id) {
            id
        }
    }
`;

export default function LibraryApp() {
    const [books, setBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [saving, setSaving] = useState(false);

    const [viewingId, setViewingId] = useState(null);
    const [detailBook, setDetailBook] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState(null);

    const [editingId, setEditingId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [updateSaving, setUpdateSaving] = useState(false);

    const loadBooks = useCallback(async () => {
        setError(null);
        setLoading(true);
        try {
            const data = await graphqlRequest(BOOKS_QUERY);
            setBooks(data.books ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setBooks([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadBooks();
    }, [loadBooks]);

    async function handleCreate(e) {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            return;
        }
        setSaving(true);
        setError(null);
        try {
            await graphqlRequest(CREATE_MUTATION, {
                title: title.trim(),
                author: author.trim(),
            });
            setTitle('');
            setAuthor('');
            await loadBooks();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not create book');
        } finally {
            setSaving(false);
        }
    }

    async function handleDelete(id) {
        setError(null);
        try {
            await graphqlRequest(DELETE_MUTATION, { id: String(id) });
            if (viewingId === String(id)) {
                closeDetail();
            }
            if (editingId === String(id)) {
                closeEdit();
            }
            await loadBooks();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete book');
        }
    }

    function closeDetail() {
        setViewingId(null);
        setDetailBook(null);
        setDetailLoading(false);
        setDetailError(null);
    }

    function closeEdit() {
        setEditingId(null);
        setEditTitle('');
        setEditAuthor('');
        setUpdateSaving(false);
    }

    async function handleView(id) {
        const sid = String(id);
        setViewingId(sid);
        setDetailBook(null);
        setDetailLoading(true);
        setDetailError(null);
        try {
            const data = await graphqlRequest(BOOK_QUERY, { id: sid });
            setDetailBook(data.book ?? null);
        } catch (e) {
            setDetailError(e instanceof Error ? e.message : 'Could not load book');
            setDetailBook(null);
        } finally {
            setDetailLoading(false);
        }
    }

    function handleEditOpen(b) {
        setEditingId(String(b.id));
        setEditTitle(b.title);
        setEditAuthor(b.author);
        setError(null);
    }

    async function handleUpdate(e) {
        e.preventDefault();
        if (!editingId || !editTitle.trim() || !editAuthor.trim()) {
            return;
        }
        setUpdateSaving(true);
        setError(null);
        try {
            await graphqlRequest(UPDATE_MUTATION, {
                id: editingId,
                title: editTitle.trim(),
                author: editAuthor.trim(),
            });
            await loadBooks();
            if (viewingId === editingId) {
                void handleView(editingId);
            }
            closeEdit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update book');
        } finally {
            setUpdateSaving(false);
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <header className="mb-10 border-b border-stone-200 pb-8 dark:border-stone-700">
                <h1 className="font-semibold tracking-tight text-3xl text-stone-900 dark:text-stone-600">
                    Library
                </h1>
                <p className="mt-2 max-w-xl text-[15px] text-stone-800 dark:text-stone-600">
                    Books loaded from GraphQL (<code className="text-sm">books</code>,{' '}
                    <code className="text-sm">book</code>,{' '}
                    <code className="text-sm">createBook</code>,{' '}
                    <code className="text-sm">updateBook</code>,{' '}
                    <code className="text-sm">deleteBook</code>).
                </p>
            </header>

            <section className="mb-10 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    Add a book
                </h2>
                <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <label className="flex flex-1 flex-col gap-1.5 text-sm">
                        <span className="text-stone-600 dark:text-stone-400">Title</span>
                        <input
                            type="text"
                            value={title}
                            onChange={(ev) => setTitle(ev.target.value)}
                            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
                            placeholder="The Left Hand of Darkness"
                            maxLength={255}
                            autoComplete="off"
                        />
                    </label>
                    <label className="flex flex-1 flex-col gap-1.5 text-sm">
                        <span className="text-stone-600 dark:text-stone-400">Author</span>
                        <input
                            type="text"
                            value={author}
                            onChange={(ev) => setAuthor(ev.target.value)}
                            className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
                            placeholder="Ursula K. Le Guin"
                            maxLength={255}
                            autoComplete="off"
                        />
                    </label>
                    <button
                        type="submit"
                        disabled={saving || !title.trim() || !author.trim()}
                        className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                    >
                        {saving ? 'Saving…' : 'Add'}
                    </button>
                </form>
            </section>

            {error ? (
                <div
                    className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
                    role="alert"
                >
                    {error}
                </div>
            ) : null}

            {viewingId ? (
                <section
                    className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900"
                    aria-live="polite"
                >
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                            View book
                        </h2>
                        <button
                            type="button"
                            onClick={closeDetail}
                            className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Close
                        </button>
                    </div>
                    {detailError ? (
                        <p className="text-sm text-red-700 dark:text-red-200">{detailError}</p>
                    ) : detailLoading ? (
                        <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                    ) : detailBook ? (
                        <div className="space-y-2 text-sm">
                            <p>
                                <span className="text-stone-500 dark:text-stone-400">Title</span>
                                <br />
                                <span className="font-medium text-stone-900 dark:text-stone-100">
                                    {detailBook.title}
                                </span>
                            </p>
                            <p>
                                <span className="text-stone-500 dark:text-stone-400">Author</span>
                                <br />
                                <span className="text-stone-800 dark:text-stone-200">{detailBook.author}</span>
                            </p>
                            <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                                id {detailBook.id}
                            </p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">
                                Created {new Date(detailBook.created_at).toLocaleString()}
                                <br />
                                Updated {new Date(detailBook.updated_at).toLocaleString()}
                            </p>
                        </div>
                    ) : (
                        <p className="text-sm text-stone-500 dark:text-stone-400">No book found for this id.</p>
                    )}
                </section>
            ) : null}

            {editingId ? (
                <section className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                            Update book
                        </h2>
                        <button
                            type="button"
                            onClick={closeEdit}
                            className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                        >
                            Cancel
                        </button>
                    </div>
                    <form onSubmit={handleUpdate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                        <label className="flex flex-1 flex-col gap-1.5 text-sm">
                            <span className="text-stone-600 dark:text-stone-400">Title</span>
                            <input
                                type="text"
                                value={editTitle}
                                onChange={(ev) => setEditTitle(ev.target.value)}
                                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
                                maxLength={255}
                                autoComplete="off"
                            />
                        </label>
                        <label className="flex flex-1 flex-col gap-1.5 text-sm">
                            <span className="text-stone-600 dark:text-stone-400">Author</span>
                            <input
                                type="text"
                                value={editAuthor}
                                onChange={(ev) => setEditAuthor(ev.target.value)}
                                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100"
                                maxLength={255}
                                autoComplete="off"
                            />
                        </label>
                        <button
                            type="submit"
                            disabled={updateSaving || !editTitle.trim() || !editAuthor.trim()}
                            className="rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                        >
                            {updateSaving ? 'Saving…' : 'Save'}
                        </button>
                    </form>
                    <p className="mt-3 font-mono text-xs text-stone-400 dark:text-stone-500">id {editingId}</p>
                </section>
            ) : null}

            <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                        Books ({loading ? '…' : books.length})
                    </h2>
                    <button
                        type="button"
                        onClick={() => void loadBooks()}
                        disabled={loading}
                        className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:no-underline disabled:opacity-50 dark:text-amber-500 dark:hover:text-amber-400"
                    >
                        Refresh
                    </button>
                </div>

                {loading ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                ) : books.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">No books yet.</p>
                ) : (
                    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                        {books.map((b) => (
                            <li
                                key={b.id}
                                className="flex items-start justify-between gap-4 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                            >
                                <div>
                                    <p className="font-medium text-stone-900 dark:text-stone-100">{b.title}</p>
                                    <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{b.author}</p>
                                    <p className="mt-2 font-mono text-xs text-stone-400 dark:text-stone-500">
                                        id {b.id}
                                    </p>
                                </div>
                                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={() => void handleView(b.id)}
                                        className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        View
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleEditOpen(b)}
                                        className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        Update
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => void handleDelete(b.id)}
                                        className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
