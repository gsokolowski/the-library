import { inputClass } from '../ui/styles.js';
import RecentActivityPanel from './RecentActivityPanel.jsx';

/**
 * Library tab: select patron, assign shelf copies, clear borrowers, loan detail.
 * State and actions are owned by useLoanDesk in the parent.
 */
export default function LibraryLoansTab({
    books,
    booksLoading,
    usersLoading,
    userSearch,
    onUserSearchChange,
    filteredPatrons,
    selectedPatronId,
    setSelectedPatronId,
    borrowSaving,
    pickedShelfIds,
    pickedBorrowedIds,
    onAssign,
    onClearBorrowers,
    onRefreshBooks,
    shelfBooks,
    borrowedBooks,
    selectedBookIds,
    onToggleBookSelect,
    viewingLoanBookId,
    loanDetailBook,
    loanDetailLoading,
    loanDetailError,
    onCloseLoanDetail,
    onViewLoanBook,
    waitlistJoiningBookId,
    onJoinWaitlist,
    activityEvents = [],
    activityLoading = false,
    activityError = null,
}) {
    return (
        <section className="mt-6 space-y-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,20rem)] lg:items-start">
                <p className="text-sm text-stone-600 dark:text-stone-400">
                    Search for a library user and select them, then tick available books and use{' '}
                    <strong className="font-medium text-stone-800 dark:text-stone-300">Assign</strong>.
                    Borrowed titles move to{' '}
                    <strong className="font-medium text-stone-800 dark:text-stone-300">On loan</strong>; tick those and
                    use{' '}
                    <strong className="font-medium text-stone-800 dark:text-stone-300">Clear borrower</strong> to return
                    them to the shelf. For books checked out to someone else, use <strong>Join waitlist</strong>.
                </p>
                <RecentActivityPanel
                    events={activityEvents}
                    loading={activityLoading}
                    error={activityError}
                />
            </div>

            <div>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                    Find a user
                </label>
                <input
                    type="search"
                    value={userSearch}
                    onChange={(ev) => onUserSearchChange(ev.target.value)}
                    className={`w-full max-w-md ${inputClass}`}
                    placeholder="Name, surname, or email…"
                    autoComplete="off"
                />
                <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                    {selectedPatronId ? (
                        <>
                            Selected library user id <span className="font-mono">{selectedPatronId}</span> — choose
                            available books, then Assign.
                        </>
                    ) : (
                        <>Click a row to select who is borrowing.</>
                    )}
                </p>
                <div className="mt-3 max-h-48 overflow-y-auto rounded-xl border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900">
                    {usersLoading ? (
                        <p className="p-4 text-sm text-stone-500">Loading…</p>
                    ) : filteredPatrons.length === 0 ? (
                        <p className="p-4 text-sm text-stone-500">No matching users.</p>
                    ) : (
                        <ul className="divide-y divide-stone-200 dark:divide-stone-700">
                            {filteredPatrons.map((u) => {
                                const sid = String(u.id);
                                const sel = selectedPatronId === sid;
                                return (
                                    <li key={u.id}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedPatronId((prev) => (prev === sid ? null : sid))
                                            }
                                            className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm transition hover:bg-stone-50 dark:hover:bg-stone-800 ${
                                                sel ? 'bg-amber-50 dark:bg-amber-950/40' : ''
                                            }`}
                                        >
                                            <span className="font-medium text-stone-900 dark:text-stone-100">
                                                {u.name} {u.surname}
                                            </span>
                                            <span className="truncate pl-2 text-stone-600 dark:text-stone-400">
                                                {u.email}
                                            </span>
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap gap-3">
                <button
                    type="button"
                    disabled={borrowSaving || !selectedPatronId || pickedShelfIds.length === 0}
                    onClick={() => void onAssign()}
                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                >
                    {borrowSaving ? 'Saving…' : 'Assign to selected user'}
                </button>
                <button
                    type="button"
                    disabled={borrowSaving || pickedBorrowedIds.length === 0}
                    onClick={() => void onClearBorrowers()}
                    className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
                >
                    Clear borrower for selected books
                </button>
            </div>

            <div className="flex items-center justify-end border-b border-stone-200 pb-3 dark:border-stone-700">
                <button
                    type="button"
                    onClick={() => void onRefreshBooks()}
                    disabled={booksLoading}
                    className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:no-underline disabled:opacity-50 dark:text-amber-500 dark:hover:text-amber-400"
                >
                    Refresh books
                </button>
            </div>

            <div>
                <div className="mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                        Available on shelf ({booksLoading ? '…' : shelfBooks.length})
                    </h2>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Only titles not currently linked to a patron.
                    </p>
                </div>

                {booksLoading ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                ) : shelfBooks.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                        {books.length === 0 ? 'No books in the library yet.' : 'All copies are on loan.'}
                    </p>
                ) : (
                    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                        {shelfBooks.map((b) => {
                            const sid = String(b.id);
                            return (
                                <li
                                    key={b.id}
                                    className="flex items-start gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 rounded border-stone-400 text-amber-700"
                                        checked={!!selectedBookIds[sid]}
                                        onChange={() => onToggleBookSelect(b.id)}
                                        aria-label={`Select ${b.title}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-stone-900 dark:text-stone-100">{b.title}</p>
                                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{b.author}</p>
                                        <p className="mt-1 font-mono text-xs text-stone-400 dark:text-stone-500">
                                            id {b.id}
                                        </p>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            <div>
                <div className="mb-4">
                    <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                        On loan ({booksLoading ? '…' : borrowedBooks.length})
                    </h2>
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                        Select here to return books (clear borrower). Join waitlist when another library user has the
                        book. Use View for loan details.
                    </p>
                </div>

                {viewingLoanBookId ? (
                    <section
                        className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900"
                        aria-live="polite"
                    >
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <h3 className="text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                                Loan details
                            </h3>
                            <button
                                type="button"
                                onClick={onCloseLoanDetail}
                                className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                            >
                                Close
                            </button>
                        </div>
                        {loanDetailError ? (
                            <p className="text-sm text-red-700 dark:text-red-200">{loanDetailError}</p>
                        ) : loanDetailLoading ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                        ) : loanDetailBook ? (
                            <div className="space-y-3 text-sm">
                                <p>
                                    <span className="text-stone-500 dark:text-stone-400">Book</span>
                                    <br />
                                    <span className="font-medium text-stone-900 dark:text-stone-100">
                                        {loanDetailBook.title}
                                    </span>
                                    <span className="text-stone-600 dark:text-stone-400"> — {loanDetailBook.author}</span>
                                </p>
                                <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                                    Copy id {loanDetailBook.id}
                                </p>
                                <div className="border-t border-stone-200 pt-3 dark:border-stone-700">
                                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-400 dark:text-stone-500">
                                        Borrowed by
                                    </p>
                                    {loanDetailBook.libraryUser ? (
                                        <div className="space-y-1.5">
                                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                                {loanDetailBook.libraryUser.name} {loanDetailBook.libraryUser.surname}
                                            </p>
                                            <p className="text-stone-800 dark:text-stone-200">
                                                {loanDetailBook.libraryUser.email}
                                            </p>
                                            <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                                                Patron id {loanDetailBook.libraryUser.id}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-stone-600 dark:text-stone-400">
                                            This copy is not linked to a patron (refresh the list).
                                        </p>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-sm text-stone-500 dark:text-stone-400">No book found for this id.</p>
                        )}
                    </section>
                ) : null}

                {booksLoading ? null : borrowedBooks.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-stone-400">Nothing on loan.</p>
                ) : (
                    <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                        {borrowedBooks.map((b) => {
                            const sid = String(b.id);
                            const borrowerId = b.libraryUser ? String(b.libraryUser.id) : null;
                            const canJoinWaitlist =
                                selectedPatronId &&
                                borrowerId &&
                                selectedPatronId !== borrowerId &&
                                onJoinWaitlist;
                            const joining = waitlistJoiningBookId === sid;
                            return (
                                <li
                                    key={b.id}
                                    className="flex items-start gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                                >
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 shrink-0 rounded border-stone-400 text-amber-700"
                                        checked={!!selectedBookIds[sid]}
                                        onChange={() => onToggleBookSelect(b.id)}
                                        aria-label={`Select borrowed ${b.title}`}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <p className="font-medium text-stone-900 dark:text-stone-100">{b.title}</p>
                                        <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{b.author}</p>
                                        <p className="mt-1 text-xs">
                                            <span className="text-stone-400 dark:text-stone-500">Borrowed by </span>
                                            <span className="text-stone-600 dark:text-stone-400">
                                                {b.libraryUser.name} {b.libraryUser.surname}
                                            </span>
                                            {b.waitlistCount > 0 ? (
                                                <span className="ml-2 text-stone-400">
                                                    · {b.waitlistCount} waiting
                                                </span>
                                            ) : null}
                                        </p>
                                        <p className="mt-1 font-mono text-xs text-stone-400 dark:text-stone-500">
                                            id {b.id}
                                        </p>
                                    </div>
                                    <div className="flex shrink-0 flex-col gap-2">
                                        {canJoinWaitlist ? (
                                            <button
                                                type="button"
                                                disabled={waitlistJoiningBookId !== null}
                                                onClick={() => void onJoinWaitlist(b.id)}
                                                className="rounded-md bg-amber-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-amber-950 disabled:opacity-50 dark:bg-amber-200 dark:text-amber-950"
                                                aria-busy={joining}
                                            >
                                                {joining ? 'Joining…' : 'Join waitlist'}
                                            </button>
                                        ) : null}
                                        <button
                                            type="button"
                                            onClick={() => void onViewLoanBook(b.id)}
                                            className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                        >
                                            View
                                        </button>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </section>
    );
}
