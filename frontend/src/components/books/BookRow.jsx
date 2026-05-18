/**
 * One row in the books list (Books tab).
 *
 * @param {{
 *   book: {
 *     id: string | number;
 *     title: string;
 *     author: string;
 *     libraryUser?: { name: string; surname: string } | null;
 *   };
 *   onView: () => void;
 *   onEdit: () => void;
 *   onDelete: () => void;
 * }} props
 */
export default function BookRow({ book, onView, onEdit, onDelete }) {
    return (
        <li className="flex items-start justify-between gap-4 px-4 py-4 first:rounded-t-xl last:rounded-b-xl">
            <div>
                <p className="font-medium text-stone-900 dark:text-stone-100">{book.title}</p>
                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{book.author}</p>
                {book.libraryUser ? (
                    <p className="mt-1 text-xs">
                        <span className="text-stone-400 dark:text-stone-500">Borrowed by </span>
                        <span className="text-stone-600 dark:text-stone-400">
                            {book.libraryUser.name} {book.libraryUser.surname}
                        </span>
                    </p>
                ) : null}
                <p className="mt-2 font-mono text-xs text-stone-400 dark:text-stone-500">id {book.id}</p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <button
                    type="button"
                    onClick={onView}
                    className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                    View
                </button>
                <button
                    type="button"
                    onClick={onEdit}
                    className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                    Update
                </button>
                <button
                    type="button"
                    onClick={onDelete}
                    className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                    Delete
                </button>
            </div>
        </li>
    );
}
