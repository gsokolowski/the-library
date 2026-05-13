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

const CREATE_MUTATION = `
    mutation ($title: String!, $author: String!) {
        createBook(title: $title, author: $author) {
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
            await loadBooks();
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Could not delete book');
        }
    }

    return (
        <div className="mx-auto max-w-2xl px-4 py-10">
            <header className="mb-10 border-b border-stone-200 pb-8 dark:border-stone-700">
                <h1 className="font-semibold tracking-tight text-3xl text-stone-900 dark:text-stone-100">
                    Library
                </h1>
                <p className="mt-2 max-w-xl text-[15px] text-stone-600 dark:text-stone-400">
                    Books loaded from GraphQL (<code className="text-sm">books</code>,{' '}
                    <code className="text-sm">createBook</code>,{' '}
                    <code className="text-sm">deleteBook</code>).
                </p>
            </header>

            <section className="mb-10 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
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

            <section>
                <div className="mb-4 flex items-center justify-between gap-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
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
                                <button
                                    type="button"
                                    onClick={() => void handleDelete(b.id)}
                                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Delete
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
}
