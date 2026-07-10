/**
 * Dismissible toast for unread library user notifications.
 *
 * @param {{ message: string; onDismiss: () => void }} props
 */
export default function NotificationToast({ message, onDismiss }) {
    return (
        <div
            className="fixed bottom-6 right-6 z-50 flex max-w-sm items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-950 shadow-lg dark:border-emerald-900/60 dark:bg-emerald-950/90 dark:text-emerald-100"
            role="status"
            aria-live="polite"
        >
            <p className="flex-1">{message}</p>
            <button
                type="button"
                onClick={onDismiss}
                className="shrink-0 rounded-md border border-emerald-300 px-2 py-0.5 text-xs font-medium transition hover:bg-emerald-100 dark:border-emerald-700 dark:hover:bg-emerald-900"
            >
                Dismiss
            </button>
        </div>
    );
}
