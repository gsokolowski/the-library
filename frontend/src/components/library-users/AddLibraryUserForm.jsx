import { inputClass } from '../ui/styles.js';

/**
 * @param {{
 *   name: string;
 *   surname: string;
 *   email: string;
 *   savingUser: boolean;
 *   onNameChange: (v: string) => void;
 *   onSurnameChange: (v: string) => void;
 *   onEmailChange: (v: string) => void;
 *   onSubmit: (e: React.FormEvent) => void;
 * }} props
 */
export default function AddLibraryUserForm({
    name,
    surname,
    email,
    savingUser,
    onNameChange,
    onSurnameChange,
    onEmailChange,
    onSubmit,
}) {
    return (
        <section className="mb-10 mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                Add a user
            </h2>
            <form onSubmit={onSubmit} className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end">
                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                    <span className="text-stone-600 dark:text-stone-400">Name</span>
                    <input
                        type="text"
                        value={name}
                        onChange={(ev) => onNameChange(ev.target.value)}
                        className={inputClass}
                        maxLength={255}
                        autoComplete="given-name"
                    />
                </label>
                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                    <span className="text-stone-600 dark:text-stone-400">Surname</span>
                    <input
                        type="text"
                        value={surname}
                        onChange={(ev) => onSurnameChange(ev.target.value)}
                        className={inputClass}
                        maxLength={255}
                        autoComplete="family-name"
                    />
                </label>
                <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm lg:min-w-48">
                    <span className="text-stone-600 dark:text-stone-400">Email</span>
                    <input
                        type="email"
                        value={email}
                        onChange={(ev) => onEmailChange(ev.target.value)}
                        className={inputClass}
                        maxLength={255}
                        autoComplete="email"
                    />
                </label>
                <button
                    type="submit"
                    disabled={savingUser || !name.trim() || !surname.trim() || !email.trim()}
                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                    {savingUser ? 'Saving…' : 'Add'}
                </button>
            </form>
        </section>
    );
}
