import { inputClass } from '../ui/styles.js';

/**
 * @param {{
 *   title: string;
 *   author: string;
 *   savingBook: boolean;
 *   onTitleChange: (v: string) => void;
 *   onAuthorChange: (v: string) => void;
 *   onSubmit: (e: React.FormEvent) => void;
 * }} props
 */
export default function AddBookForm({ title, author, savingBook, onTitleChange, onAuthorChange, onSubmit }) {
    return (
        <section className="mb-10 mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                Add a book
            </h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                    <span className="text-stone-600 dark:text-stone-400">Title</span>
                    <input
                        type="text"
                        value={title}
                        onChange={(ev) => onTitleChange(ev.target.value)}
                        className={inputClass}
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
                        onChange={(ev) => onAuthorChange(ev.target.value)}
                        className={inputClass}
                        placeholder="Ursula K. Le Guin"
                        maxLength={255}
                        autoComplete="off"
                    />
                </label>
                <button
                    type="submit"
                    disabled={savingBook || !title.trim() || !author.trim()}
                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                    {savingBook ? 'Saving…' : 'Add'}
                </button>
            </form>
        </section>
    );
}
