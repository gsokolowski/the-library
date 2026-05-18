import LibraryUserRow from './LibraryUserRow.jsx';

/**
 * @param {{
 *   users: Array<{ id: string | number; name: string; surname: string; email: string }>;
 *   loading: boolean;
 *   onRefresh: () => void;
 *   onViewUser: (id: string | number) => void;
 *   onEditUser: (u: { id: string | number; name: string; surname: string; email: string }) => void;
 *   onDeleteUser: (id: string | number) => void;
 * }} props
 */
export default function LibraryUserList({
    users,
    loading,
    onRefresh,
    onViewUser,
    onEditUser,
    onDeleteUser,
}) {
    return (
        <section>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    Users ({loading ? '…' : users.length})
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
            ) : users.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-stone-400">No users yet.</p>
            ) : (
                <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                    {users.map((u) => (
                        <LibraryUserRow
                            key={u.id}
                            user={u}
                            onView={() => onViewUser(u.id)}
                            onEdit={() => onEditUser(u)}
                            onDelete={() => onDeleteUser(u.id)}
                        />
                    ))}
                </ul>
            )}
        </section>
    );
}
