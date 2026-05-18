import { inputClass } from '../ui/styles.js';

/**
 * @param {{
 *   editingId: string;
 *   editTitle: string;
 *   editAuthor: string;
 *   onEditTitleChange: (v: string) => void;
 *   onEditAuthorChange: (v: string) => void;
 *   onSubmit: (e: React.FormEvent) => void;
 *   onCancel: () => void;
 *   saving: boolean;
 * }} props
 */
export default function BookEditPanel({
    editingId,
    editTitle,
    editAuthor,
    onEditTitleChange,
    onEditAuthorChange,
    onSubmit,
    onCancel,
    saving,
}) {
    return (
        <section className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <div className="mb-4 flex items-start justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    Update book
                </h2>
                <button
                    type="button"
                    onClick={onCancel}
                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                >
                    Cancel
                </button>
            </div>
            <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                    <span className="text-stone-600 dark:text-stone-400">Title</span>
                    <input
                        type="text"
                        value={editTitle}
                        onChange={(ev) => onEditTitleChange(ev.target.value)}
                        className={inputClass}
                        maxLength={255}
                        autoComplete="off"
                    />
                </label>
                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                    <span className="text-stone-600 dark:text-stone-400">Author</span>
                    <input
                        type="text"
                        value={editAuthor}
                        onChange={(ev) => onEditAuthorChange(ev.target.value)}
                        className={inputClass}
                        maxLength={255}
                        autoComplete="off"
                    />
                </label>
                <button
                    type="submit"
                    disabled={saving || !editTitle.trim() || !editAuthor.trim()}
                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                    {saving ? 'Saving…' : 'Save'}
                </button>
            </form>
            <p className="mt-3 font-mono text-xs text-stone-400 dark:text-stone-500">id {editingId}</p>
        </section>
    );
}
