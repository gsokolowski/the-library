/**
 * Desk activity feed: recent borrow / return lines.
 */
export default function RecentActivityPanel({ events, loading, error }) {
    return (
        <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-400">
                Recent activity
            </h2>
            {error ? (
                <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
                    {error}
                </p>
            ) : null}
            {loading && events.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">Loading…</p>
            ) : events.length === 0 ? (
                <p className="mt-3 text-sm text-stone-500">No desk activity yet.</p>
            ) : (
                <ul className="mt-3 max-h-64 space-y-2 overflow-y-auto text-sm text-stone-700 dark:text-stone-300">
                    {events.map((ev) => (
                        <li key={ev.id} className="border-b border-stone-100 pb-2 last:border-0 last:pb-0 dark:border-stone-800">
                            {ev.summary}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
