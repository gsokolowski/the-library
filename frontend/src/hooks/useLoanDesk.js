import { useMemo, useState } from 'react';
import { graphqlRequest } from '../graphqlClient.js';
import { BOOK_QUERY, SET_BOOK_LIBRARY_USER_MUTATION } from '../queries.js';

/**
 * @param {object} opts
 * @param {React.Dispatch<React.SetStateAction<string | null>>} opts.setError
 * @param {unknown[]} opts.books
 * @param {() => Promise<void>} opts.loadBooks
 * @param {Array<{ id: string | number; name: string; surname: string; email: string }>} opts.libraryUsers
 * @param {(bookId: string | number, libraryUserId: string) => Promise<void>} [opts.joinWaitlist]
 */
export function useLoanDesk({ setError, books, loadBooks, libraryUsers, joinWaitlist }) {
    const [userSearch, setUserSearch] = useState('');
    const [selectedPatronId, setSelectedPatronId] = useState(null);
    const [selectedBookIds, setSelectedBookIds] = useState(() => ({}));
    const [borrowSaving, setBorrowSaving] = useState(false);

    const [viewingLoanBookId, setViewingLoanBookId] = useState(null);
    const [loanDetailBook, setLoanDetailBook] = useState(null);
    const [loanDetailLoading, setLoanDetailLoading] = useState(false);
    const [loanDetailError, setLoanDetailError] = useState(null);
    const [waitlistJoiningBookId, setWaitlistJoiningBookId] = useState(null);

    const filteredPatrons = useMemo(() => {
        const q = userSearch.trim().toLowerCase();
        if (!q) {
            return libraryUsers;
        }
        return libraryUsers.filter((u) => {
            const hay = `${u.name} ${u.surname} ${u.email}`.toLowerCase();
            return hay.includes(q);
        });
    }, [libraryUsers, userSearch]);

    const shelfBooks = useMemo(() => books.filter((b) => !b.libraryUser), [books]);

    const borrowedBooks = useMemo(() => books.filter((b) => !!b.libraryUser), [books]);

    const pickedBookIdList = useMemo(
        () => Object.keys(selectedBookIds).filter((k) => selectedBookIds[k]),
        [selectedBookIds],
    );

    const pickedShelfIds = useMemo(
        () =>
            pickedBookIdList.filter((id) => shelfBooks.some((b) => String(b.id) === id)),
        [pickedBookIdList, shelfBooks],
    );

    const pickedBorrowedIds = useMemo(
        () =>
            pickedBookIdList.filter((id) => borrowedBooks.some((b) => String(b.id) === id)),
        [pickedBookIdList, borrowedBooks],
    );

    function closeLoanBookDetail() {
        setViewingLoanBookId(null);
        setLoanDetailBook(null);
        setLoanDetailLoading(false);
        setLoanDetailError(null);
    }

    async function handleViewLoanBook(id) {
        const sid = String(id);
        setViewingLoanBookId(sid);
        setLoanDetailBook(null);
        setLoanDetailLoading(true);
        setLoanDetailError(null);
        try {
            const data = await graphqlRequest(BOOK_QUERY, { id: sid });
            setLoanDetailBook(data.book ?? null);
        } catch (err) {
            setLoanDetailError(err instanceof Error ? err.message : 'Could not load book');
            setLoanDetailBook(null);
        } finally {
            setLoanDetailLoading(false);
        }
    }

    function toggleBookSelect(id) {
        const sid = String(id);
        setSelectedBookIds((prev) => ({ ...prev, [sid]: !prev[sid] }));
    }

    async function handleAssignBooksToPatron() {
        if (!selectedPatronId || pickedShelfIds.length === 0) {
            return;
        }
        setBorrowSaving(true);
        setError(null);
        try {
            await Promise.all(
                pickedShelfIds.map((bid) =>
                    graphqlRequest(SET_BOOK_LIBRARY_USER_MUTATION, {
                        id: bid,
                        libraryUserId: selectedPatronId,
                    }),
                ),
            );
            setSelectedBookIds({});
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not assign books');
        } finally {
            setBorrowSaving(false);
        }
    }

    async function handleClearBorrowersForSelectedBooks() {
        if (pickedBorrowedIds.length === 0) {
            return;
        }
        setBorrowSaving(true);
        setError(null);
        try {
            await Promise.all(
                pickedBorrowedIds.map((bid) =>
                    graphqlRequest(SET_BOOK_LIBRARY_USER_MUTATION, {
                        id: bid,
                        libraryUserId: null,
                    }),
                ),
            );
            setSelectedBookIds({});
            if (viewingLoanBookId && pickedBorrowedIds.includes(viewingLoanBookId)) {
                closeLoanBookDetail();
            }
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update books');
        } finally {
            setBorrowSaving(false);
        }
    }

    async function handleJoinWaitlistForBook(bookId) {
        if (!selectedPatronId || !joinWaitlist) {
            return;
        }
        const sid = String(bookId);
        setWaitlistJoiningBookId(sid);
        setError(null);
        try {
            await joinWaitlist(sid, selectedPatronId);
        } catch {
            // Error surfaced by joinWaitlist / setError
        } finally {
            setWaitlistJoiningBookId(null);
        }
    }

    return {
        userSearch,
        setUserSearch,
        selectedPatronId,
        setSelectedPatronId,
        selectedBookIds,
        borrowSaving,
        viewingLoanBookId,
        loanDetailBook,
        loanDetailLoading,
        loanDetailError,
        filteredPatrons,
        shelfBooks,
        borrowedBooks,
        pickedShelfIds,
        pickedBorrowedIds,
        closeLoanBookDetail,
        handleViewLoanBook,
        toggleBookSelect,
        handleAssignBooksToPatron,
        handleClearBorrowersForSelectedBooks,
        waitlistJoiningBookId,
        handleJoinWaitlistForBook,
    };
}