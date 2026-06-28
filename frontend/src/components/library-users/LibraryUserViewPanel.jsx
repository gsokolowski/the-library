/**
 * @param {{
 *   onClose: () => void;
 *   detailUser: null | {
 *     id: string;
 *     name: string;
 *     surname: string;
 *     email: string;
 *     created_at: string;
 *     books?: Array<{ id: string; title: string; author: string }>;
 *   };
 *   detailLoading: boolean;
 *   detailError: string | null;
 *   onReturnBook?: (bookId: string) => void | Promise<void>;
 *   returningBookId?: string | null;
 * }} props
 */
export default function LibraryUserViewPanel({
    onClose,
    detailUser,
    detailLoading,
    detailError,
    onReturnBook,
    returningBookId,
}) {
    return (
        <section
            className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900"
            aria-live="polite"
        >
            <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    View user
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
            ) : detailUser ? (
                <div className="space-y-3 text-sm">
                    <p>
                        <span className="text-stone-500 dark:text-stone-400">Name</span>
                        <br />
                        <span className="font-medium text-stone-900 dark:text-stone-100">
                            {detailUser.name} {detailUser.surname}
                        </span>
                    </p>
                    <p>
                        <span className="text-stone-500 dark:text-stone-400">Email</span>
                        <br />
                        <span className="text-stone-800 dark:text-stone-200">{detailUser.email}</span>
                    </p>
                    <p className="font-mono text-xs text-stone-500 dark:text-stone-400">id {detailUser.id}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                        Joined {new Date(detailUser.created_at).toLocaleString()}
                    </p>
                    <div>
                        <p className="mb-1 text-stone-500 dark:text-stone-400">Books checked out</p>
                        {detailUser.books?.length ? (
                            <ul className="space-y-2 text-stone-800 dark:text-stone-200">
                                {detailUser.books.map((bk) => {
                                    const bid = String(bk.id);
                                    const busyHere = returningBookId === bid;
                                    return (
                                        <li key={bk.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-stone-200 px-3 py-2 dark:border-stone-600">
                                            <span>
                                                <span className="font-medium">{bk.title}</span>{' '}
                                                <span className="text-stone-500">— {bk.author}</span>
                                            </span>
                                            {onReturnBook ? (
                                                <button
                                                    type="button"
                                                    disabled={returningBookId !== null}
                                                    onClick={() => void onReturnBook(bid)}
                                                    className="shrink-0 rounded-md bg-stone-800 px-3 py-1 text-xs font-medium text-white transition hover:bg-stone-950 disabled:pointer-events-none disabled:opacity-50 dark:bg-stone-200 dark:text-stone-900 dark:hover:bg-white"
                                                    aria-busy={busyHere}
                                                    aria-label={`Return "${bk.title}" to shelf`}
                                                >
                                                    {busyHere ? 'Returning…' : 'Return book'}
                                                </button>
                                            ) : null}
                                        </li>
                                    );
                                })}
                            </ul>
                        ) : (
                            <p className="text-stone-600 dark:text-stone-400">None.</p>
                        )}
                    </div>
                </div>
            ) : (
                <p className="text-sm text-stone-500 dark:text-stone-400">No user found for this id.</p>
            )}
        </section>
    );
}
