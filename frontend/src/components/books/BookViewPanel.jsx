/**
 * @param {{
 *   onClose: () => void;
 *   detailBook: null | {
 *     id: string;
 *     title: string;
 *     author: string;
 *     libraryUser?: { name: string; surname: string; email: string } | null;
 *     created_at: string;
 *     updated_at: string;
 *   };
 *   detailLoading: boolean;
 *   detailError: string | null;
 * }} props
 */
export default function BookViewPanel({ onClose, detailBook, detailLoading, detailError }) {
    return (
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
                    onClick={onClose}
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
                        <span className="font-medium text-stone-900 dark:text-stone-100">{detailBook.title}</span>
                    </p>
                    <p>
                        <span className="text-stone-500 dark:text-stone-400">Author</span>
                        <br />
                        <span className="text-stone-800 dark:text-stone-200">{detailBook.author}</span>
                    </p>
                    <p>
                        <span className="text-stone-400 dark:text-stone-500">Borrowed by</span>
                        <br />
                        <span className="text-stone-800 dark:text-stone-200">
                            {detailBook.libraryUser
                                ? `${detailBook.libraryUser.name} ${detailBook.libraryUser.surname} (${detailBook.libraryUser.email})`
                                : '—'}
                        </span>
                    </p>
                    <p className="font-mono text-xs text-stone-500 dark:text-stone-400">id {detailBook.id}</p>
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
    );
}
