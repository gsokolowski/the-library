import BookRow from './BookRow.jsx';

/**
 * @param {{
 *   books: Array<{
 *     id: string | number;
 *     title: string;
 *     author: string;
 *     libraryUser?: { name: string; surname: string } | null;
 *   }>;
 *   loading: boolean;
 *   onRefresh: () => void;
 *   onViewBook: (id: string | number) => void;
 *   onEditBook: (book: { id: string | number; title: string; author: string }) => void;
 *   onDeleteBook: (id: string | number) => void;
 * }} props
 */
export default function BookList({
    books,
    loading,
    onRefresh,
    onViewBook,
    onEditBook,
    onDeleteBook,
}) {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    Books ({loading ? '…' : books.length})
                </h2>
                <button
                    type="button"
                    onClick={onRefresh}
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
                        <BookRow
                            key={b.id}
                            book={b}
                            onView={() => onViewBook(b.id)}
                            onEdit={() => onEditBook(b)}
                            onDelete={() => onDeleteBook(b.id)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
