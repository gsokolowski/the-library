import { useCallback, useEffect, useMemo, useState } from 'react';
import { graphqlRequest } from './graphqlClient.js';
import {
    BOOKS_QUERY,
    BOOK_QUERY,
    CREATE_BOOK_MUTATION,
    CREATE_LIBRARY_USER_MUTATION,
    DELETE_BOOK_MUTATION,
    DELETE_LIBRARY_USER_MUTATION,
    LIBRARY_USERS_QUERY,
    LIBRARY_USER_QUERY,
    SET_BOOK_LIBRARY_USER_MUTATION,
    UPDATE_BOOK_MUTATION,
    UPDATE_LIBRARY_USER_MUTATION,
} from './queries.js';

const tabBtn = (active) =>
    `rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium transition ${
        active
            ? 'border-stone-300 bg-white text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100'
            : 'border-transparent text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
    }`;

const inputClass =
    'rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100';

export default function LibraryApp() {
    const [activeTab, setActiveTab] = useState('books');

    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(true);
    const [error, setError] = useState(null);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [savingBook, setSavingBook] = useState(false);

    const [viewingBookId, setViewingBookId] = useState(null);
    const [detailBook, setDetailBook] = useState(null);
    const [detailBookLoading, setDetailBookLoading] = useState(false);
    const [detailBookError, setDetailBookError] = useState(null);

    const [editingBookId, setEditingBookId] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editAuthor, setEditAuthor] = useState('');
    const [updateBookSaving, setUpdateBookSaving] = useState(false);

    const [libraryUsers, setLibraryUsers] = useState([]);
    const [usersLoading, setUsersLoading] = useState(false);
    const [userName, setUserName] = useState('');
    const [userSurname, setUserSurname] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [savingUser, setSavingUser] = useState(false);

    const [viewingUserId, setViewingUserId] = useState(null);
    const [detailUser, setDetailUser] = useState(null);
    const [detailUserLoading, setDetailUserLoading] = useState(false);
    const [detailUserError, setDetailUserError] = useState(null);

    const [editingUserId, setEditingUserId] = useState(null);
    const [editUserName, setEditUserName] = useState('');
    const [editUserSurname, setEditUserSurname] = useState('');
    const [editUserEmail, setEditUserEmail] = useState('');
    const [updateUserSaving, setUpdateUserSaving] = useState(false);

    const [userSearch, setUserSearch] = useState('');
    const [selectedPatronId, setSelectedPatronId] = useState(null);
    const [selectedBookIds, setSelectedBookIds] = useState(() => ({}));
    const [borrowSaving, setBorrowSaving] = useState(false);

    const [viewingLoanBookId, setViewingLoanBookId] = useState(null);
    const [loanDetailBook, setLoanDetailBook] = useState(null);
    const [loanDetailLoading, setLoanDetailLoading] = useState(false);
    const [loanDetailError, setLoanDetailError] = useState(null);

    const loadBooks = useCallback(async () => {
        setError(null);
        setBooksLoading(true);
        try {
            const data = await graphqlRequest(BOOKS_QUERY);
            setBooks(data.books ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setBooks([]);
        } finally {
            setBooksLoading(false);
        }
    }, []);

    const loadLibraryUsers = useCallback(async () => {
        setError(null);
        setUsersLoading(true);
        try {
            const data = await graphqlRequest(LIBRARY_USERS_QUERY);
            setLibraryUsers(data.libraryUsers ?? []);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Request failed');
            setLibraryUsers([]);
        } finally {
            setUsersLoading(false);
        }
    }, []);

    useEffect(() => {
        void loadBooks();
    }, [loadBooks]);

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'library') {
            void loadLibraryUsers();
        }
    }, [activeTab, loadLibraryUsers]);

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

    function switchTab(tab) {
        setActiveTab(tab);
        setError(null);
        if (tab !== 'library') {
            closeLoanBookDetail();
        }
    }

    async function handleCreateBook(e) {
        e.preventDefault();
        if (!title.trim() || !author.trim()) {
            return;
        }
        setSavingBook(true);
        setError(null);
        try {
            await graphqlRequest(CREATE_BOOK_MUTATION, {
                title: title.trim(),
                author: author.trim(),
            });
            setTitle('');
            setAuthor('');
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create book');
        } finally {
            setSavingBook(false);
        }
    }

    async function handleDeleteBook(id) {
        setError(null);
        try {
            await graphqlRequest(DELETE_BOOK_MUTATION, { id: String(id) });
            if (viewingBookId === String(id)) {
                closeBookDetail();
            }
            if (editingBookId === String(id)) {
                closeBookEdit();
            }
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete book');
        }
    }

    function closeBookDetail() {
        setViewingBookId(null);
        setDetailBook(null);
        setDetailBookLoading(false);
        setDetailBookError(null);
    }

    function closeBookEdit() {
        setEditingBookId(null);
        setEditTitle('');
        setEditAuthor('');
        setUpdateBookSaving(false);
    }

    async function handleViewBook(id) {
        const sid = String(id);
        setViewingBookId(sid);
        setDetailBook(null);
        setDetailBookLoading(true);
        setDetailBookError(null);
        try {
            const data = await graphqlRequest(BOOK_QUERY, { id: sid });
            setDetailBook(data.book ?? null);
        } catch (err) {
            setDetailBookError(err instanceof Error ? err.message : 'Could not load book');
            setDetailBook(null);
        } finally {
            setDetailBookLoading(false);
        }
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

    function handleEditBookOpen(b) {
        setEditingBookId(String(b.id));
        setEditTitle(b.title);
        setEditAuthor(b.author);
        setError(null);
    }

    async function handleUpdateBook(e) {
        e.preventDefault();
        if (!editingBookId || !editTitle.trim() || !editAuthor.trim()) {
            return;
        }
        setUpdateBookSaving(true);
        setError(null);
        try {
            await graphqlRequest(UPDATE_BOOK_MUTATION, {
                id: editingBookId,
                title: editTitle.trim(),
                author: editAuthor.trim(),
            });
            await loadBooks();
            if (viewingBookId === editingBookId) {
                void handleViewBook(editingBookId);
            }
            closeBookEdit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update book');
        } finally {
            setUpdateBookSaving(false);
        }
    }

    async function handleCreateUser(e) {
        e.preventDefault();
        if (!userName.trim() || !userSurname.trim() || !userEmail.trim()) {
            return;
        }
        setSavingUser(true);
        setError(null);
        try {
            await graphqlRequest(CREATE_LIBRARY_USER_MUTATION, {
                name: userName.trim(),
                surname: userSurname.trim(),
                email: userEmail.trim(),
            });
            setUserName('');
            setUserSurname('');
            setUserEmail('');
            await loadLibraryUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not create patron');
        } finally {
            setSavingUser(false);
        }
    }

    async function handleDeleteUser(id) {
        setError(null);
        try {
            await graphqlRequest(DELETE_LIBRARY_USER_MUTATION, { id: String(id) });
            if (viewingUserId === String(id)) {
                closeUserDetail();
            }
            if (editingUserId === String(id)) {
                closeUserEdit();
            }
            if (selectedPatronId === String(id)) {
                setSelectedPatronId(null);
            }
            await loadLibraryUsers();
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete patron');
        }
    }

    function closeUserDetail() {
        setViewingUserId(null);
        setDetailUser(null);
        setDetailUserLoading(false);
        setDetailUserError(null);
    }

    function closeUserEdit() {
        setEditingUserId(null);
        setEditUserName('');
        setEditUserSurname('');
        setEditUserEmail('');
        setUpdateUserSaving(false);
    }

    async function handleViewUser(id) {
        const sid = String(id);
        setViewingUserId(sid);
        setDetailUser(null);
        setDetailUserLoading(true);
        setDetailUserError(null);
        try {
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: sid });
            setDetailUser(data.libraryUser ?? null);
        } catch (err) {
            setDetailUserError(err instanceof Error ? err.message : 'Could not load patron');
            setDetailUser(null);
        } finally {
            setDetailUserLoading(false);
        }
    }

    function handleEditUserOpen(u) {
        setEditingUserId(String(u.id));
        setEditUserName(u.name);
        setEditUserSurname(u.surname);
        setEditUserEmail(u.email);
        setError(null);
    }

    async function handleUpdateUser(e) {
        e.preventDefault();
        if (
            !editingUserId ||
            !editUserName.trim() ||
            !editUserSurname.trim() ||
            !editUserEmail.trim()
        ) {
            return;
        }
        setUpdateUserSaving(true);
        setError(null);
        try {
            await graphqlRequest(UPDATE_LIBRARY_USER_MUTATION, {
                id: editingUserId,
                name: editUserName.trim(),
                surname: editUserSurname.trim(),
                email: editUserEmail.trim(),
            });
            await loadLibraryUsers();
            if (viewingUserId === editingUserId) {
                void handleViewUser(editingUserId);
            }
            closeUserEdit();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not update patron');
        } finally {
            setUpdateUserSaving(false);
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

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <header className="mb-6 border-b border-stone-200 pb-6 dark:border-stone-700">
                <h1 className="font-semibold tracking-tight text-3xl text-stone-900 dark:text-stone-600">
                    Library
                </h1>
                <p className="mt-2 max-w-3xl text-[15px] text-stone-800 dark:text-stone-600">
                    Manage books and patrons, then link borrowings on the Library tab (GraphQL API).
                </p>
            </header>

            <nav className="flex flex-wrap gap-1" aria-label="Primary">
                <button type="button" className={tabBtn(activeTab === 'books')} onClick={() => switchTab('books')}>
                    Books
                </button>
                <button type="button" className={tabBtn(activeTab === 'users')} onClick={() => switchTab('users')}>
                    Users
                </button>
                <button
                    type="button"
                    className={tabBtn(activeTab === 'library')}
                    onClick={() => switchTab('library')}
                >
                    Library
                </button>
            </nav>

            {error ? (
                <div
                    className="mb-6 mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200"
                    role="alert"
                >
                    {error}
                </div>
            ) : null}

            {activeTab === 'books' ? (
                <>
                    <section className="mb-10 mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                            Add a book
                        </h2>
                        <form
                            onSubmit={handleCreateBook}
                            className="flex flex-col gap-4 sm:flex-row sm:items-end"
                        >
                            <label className="flex flex-1 flex-col gap-1.5 text-sm">
                                <span className="text-stone-600 dark:text-stone-400">Title</span>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(ev) => setTitle(ev.target.value)}
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
                                    onChange={(ev) => setAuthor(ev.target.value)}
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

                    {viewingBookId ? (
                        <section
                            className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900"
                            aria-live="polite"
                        >
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                    View book
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeBookDetail}
                                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Close
                                </button>
                            </div>
                            {detailBookError ? (
                                <p className="text-sm text-red-700 dark:text-red-200">{detailBookError}</p>
                            ) : detailBookLoading ? (
                                <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                            ) : detailBook ? (
                                <div className="space-y-2 text-sm">
                                    <p>
                                        <span className="text-stone-500 dark:text-stone-400">Title</span>
                                        <br />
                                        <span className="font-medium text-stone-900 dark:text-stone-100">
                                            {detailBook.title}
                                        </span>
                                    </p>
                                    <p>
                                        <span className="text-stone-500 dark:text-stone-400">Author</span>
                                        <br />
                                        <span className="text-stone-800 dark:text-stone-200">{detailBook.author}</span>
                                    </p>
                                    <p>
                                        <span className="text-stone-400 dark:text-stone-500">Borrowed by</span>
                                        <br />
                                        <span className="text-stone-800 dark:text-stone-200">
                                            {detailBook.libraryUser
                                                ? `${detailBook.libraryUser.name} ${detailBook.libraryUser.surname} (${detailBook.libraryUser.email})`
                                                : '—'}
                                        </span>
                                    </p>
                                    <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                                        id {detailBook.id}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        Created {new Date(detailBook.created_at).toLocaleString()}
                                        <br />
                                        Updated {new Date(detailBook.updated_at).toLocaleString()}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-sm text-stone-500 dark:text-stone-400">No book found for this id.</p>
                            )}
                        </section>
                    ) : null}

                    {editingBookId ? (
                        <section className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                    Update book
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeBookEdit}
                                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Cancel
                                </button>
                            </div>
                            <form
                                onSubmit={handleUpdateBook}
                                className="flex flex-col gap-4 sm:flex-row sm:items-end"
                            >
                                <label className="flex flex-1 flex-col gap-1.5 text-sm">
                                    <span className="text-stone-600 dark:text-stone-400">Title</span>
                                    <input
                                        type="text"
                                        value={editTitle}
                                        onChange={(ev) => setEditTitle(ev.target.value)}
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
                                        onChange={(ev) => setEditAuthor(ev.target.value)}
                                        className={inputClass}
                                        maxLength={255}
                                        autoComplete="off"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={
                                        updateBookSaving || !editTitle.trim() || !editAuthor.trim()
                                    }
                                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                                >
                                    {updateBookSaving ? 'Saving…' : 'Save'}
                                </button>
                            </form>
                            <p className="mt-3 font-mono text-xs text-stone-400 dark:text-stone-500">
                                id {editingBookId}
                            </p>
                        </section>
                    ) : null}

                    <section>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                Books ({booksLoading ? '…' : books.length})
                            </h2>
                            <button
                                type="button"
                                onClick={() => void loadBooks()}
                                disabled={booksLoading}
                                className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:no-underline disabled:opacity-50 dark:text-amber-500 dark:hover:text-amber-400"
                            >
                                Refresh
                            </button>
                        </div>

                        {booksLoading ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                        ) : books.length === 0 ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">No books yet.</p>
                        ) : (
                            <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                                {books.map((b) => (
                                    <li
                                        key={b.id}
                                        className="flex items-start justify-between gap-4 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-900 dark:text-stone-100">{b.title}</p>
                                            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{b.author}</p>
                                            {b.libraryUser ? (
                                                <p className="mt-1 text-xs">
                                                    <span className="text-stone-400 dark:text-stone-500">Borrowed by </span>
                                                    <span className="text-stone-600 dark:text-stone-400">
                                                        {b.libraryUser.name} {b.libraryUser.surname}
                                                    </span>
                                                </p>
                                            ) : null}
                                            <p className="mt-2 font-mono text-xs text-stone-400 dark:text-stone-500">
                                                id {b.id}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleViewBook(b.id)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEditBookOpen(b)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDeleteBook(b.id)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            ) : null}

            {activeTab === 'users' ? (
                <>
                    <section className="mb-10 mt-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                            Add a user
                        </h2>
                        <form
                            onSubmit={handleCreateUser}
                            className="flex flex-col flex-wrap gap-4 sm:flex-row sm:items-end"
                        >
                            <label className="flex flex-1 flex-col gap-1.5 text-sm">
                                <span className="text-stone-600 dark:text-stone-400">Name</span>
                                <input
                                    type="text"
                                    value={userName}
                                    onChange={(ev) => setUserName(ev.target.value)}
                                    className={inputClass}
                                    maxLength={255}
                                    autoComplete="given-name"
                                />
                            </label>
                            <label className="flex flex-1 flex-col gap-1.5 text-sm">
                                <span className="text-stone-600 dark:text-stone-400">Surname</span>
                                <input
                                    type="text"
                                    value={userSurname}
                                    onChange={(ev) => setUserSurname(ev.target.value)}
                                    className={inputClass}
                                    maxLength={255}
                                    autoComplete="family-name"
                                />
                            </label>
                            <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm lg:min-w-48">
                                <span className="text-stone-600 dark:text-stone-400">Email</span>
                                <input
                                    type="email"
                                    value={userEmail}
                                    onChange={(ev) => setUserEmail(ev.target.value)}
                                    className={inputClass}
                                    maxLength={255}
                                    autoComplete="email"
                                />
                            </label>
                            <button
                                type="submit"
                                disabled={
                                    savingUser ||
                                    !userName.trim() ||
                                    !userSurname.trim() ||
                                    !userEmail.trim()
                                }
                                className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                            >
                                {savingUser ? 'Saving…' : 'Add'}
                            </button>
                        </form>
                    </section>

                    {viewingUserId ? (
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
                                    onClick={closeUserDetail}
                                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Close
                                </button>
                            </div>
                            {detailUserError ? (
                                <p className="text-sm text-red-700 dark:text-red-200">{detailUserError}</p>
                            ) : detailUserLoading ? (
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
                                    <p className="font-mono text-xs text-stone-500 dark:text-stone-400">
                                        id {detailUser.id}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">
                                        Joined {new Date(detailUser.created_at).toLocaleString()}
                                    </p>
                                    <div>
                                        <p className="mb-1 text-stone-500 dark:text-stone-400">Books checked out</p>
                                        {detailUser.books?.length ? (
                                            <ul className="list-inside list-disc text-stone-800 dark:text-stone-200">
                                                {detailUser.books.map((bk) => (
                                                    <li key={bk.id}>
                                                        {bk.title} <span className="text-stone-500">— {bk.author}</span>
                                                    </li>
                                                ))}
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
                    ) : null}

                    {editingUserId ? (
                        <section className="mb-6 rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-700 dark:bg-stone-900">
                            <div className="mb-4 flex items-start justify-between gap-4">
                                <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                    Update user
                                </h2>
                                <button
                                    type="button"
                                    onClick={closeUserEdit}
                                    className="shrink-0 rounded-md border border-stone-300 px-3 py-1 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                >
                                    Cancel
                                </button>
                            </div>
                            <form
                                onSubmit={handleUpdateUser}
                                className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
                            >
                                <label className="flex flex-1 flex-col gap-1.5 text-sm sm:min-w-[140px]">
                                    <span className="text-stone-600 dark:text-stone-400">Name</span>
                                    <input
                                        type="text"
                                        value={editUserName}
                                        onChange={(ev) => setEditUserName(ev.target.value)}
                                        className={inputClass}
                                        maxLength={255}
                                        autoComplete="off"
                                    />
                                </label>
                                <label className="flex flex-1 flex-col gap-1.5 text-sm sm:min-w-[140px]">
                                    <span className="text-stone-600 dark:text-stone-400">Surname</span>
                                    <input
                                        type="text"
                                        value={editUserSurname}
                                        onChange={(ev) => setEditUserSurname(ev.target.value)}
                                        className={inputClass}
                                        maxLength={255}
                                        autoComplete="off"
                                    />
                                </label>
                                <label className="flex flex-[2] flex-col gap-1.5 text-sm sm:min-w-[200px]">
                                    <span className="text-stone-600 dark:text-stone-400">Email</span>
                                    <input
                                        type="email"
                                        value={editUserEmail}
                                        onChange={(ev) => setEditUserEmail(ev.target.value)}
                                        className={inputClass}
                                        maxLength={255}
                                        autoComplete="off"
                                    />
                                </label>
                                <button
                                    type="submit"
                                    disabled={
                                        updateUserSaving ||
                                        !editUserName.trim() ||
                                        !editUserSurname.trim() ||
                                        !editUserEmail.trim()
                                    }
                                    className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                                >
                                    {updateUserSaving ? 'Saving…' : 'Save'}
                                </button>
                            </form>
                            <p className="mt-3 font-mono text-xs text-stone-400 dark:text-stone-500">
                                id {editingUserId}
                            </p>
                        </section>
                    ) : null}

                    <section>
                        <div className="mb-4 flex items-center justify-between gap-4">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                Users ({usersLoading ? '…' : libraryUsers.length})
                            </h2>
                            <button
                                type="button"
                                onClick={() => void loadLibraryUsers()}
                                disabled={usersLoading}
                                className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:no-underline disabled:opacity-50 dark:text-amber-500 dark:hover:text-amber-400"
                            >
                                Refresh
                            </button>
                        </div>

                        {usersLoading ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                        ) : libraryUsers.length === 0 ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">No users yet.</p>
                        ) : (
                            <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                                {libraryUsers.map((u) => (
                                    <li
                                        key={u.id}
                                        className="flex items-start justify-between gap-4 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                                    >
                                        <div>
                                            <p className="font-medium text-stone-900 dark:text-stone-100">
                                                {u.name} {u.surname}
                                            </p>
                                            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">{u.email}</p>
                                            <p className="mt-2 font-mono text-xs text-stone-400 dark:text-stone-500">
                                                id {u.id}
                                            </p>
                                        </div>
                                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => void handleViewUser(u.id)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                View
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleEditUserOpen(u)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                Update
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => void handleDeleteUser(u.id)}
                                                className="rounded-md border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100 dark:border-stone-600 dark:text-stone-300 dark:hover:bg-stone-800"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            ) : null}

            {activeTab === 'library' ? (
                <section className="mt-6 space-y-8">
                    <p className="text-sm text-stone-600 dark:text-stone-400">
                        Search for a patron and select them, then tick available books and use{' '}
                        <strong className="font-medium text-stone-800 dark:text-stone-300">Assign</strong>.
                        Borrowed titles move to <strong className="font-medium text-stone-800 dark:text-stone-300">On loan</strong>;
                        tick those and use{' '}
                        <strong className="font-medium text-stone-800 dark:text-stone-300">Clear borrower</strong> to return
                        them to the shelf.
                    </p>

                    <div>
                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                            Find a user
                        </label>
                        <input
                            type="search"
                            value={userSearch}
                            onChange={(ev) => setUserSearch(ev.target.value)}
                            className={`w-full max-w-md ${inputClass}`}
                            placeholder="Name, surname, or email…"
                            autoComplete="off"
                        />
                        <p className="mt-2 text-xs text-stone-500 dark:text-stone-400">
                            {selectedPatronId ? (
                                <>
                                    Selected patron id{' '}
                                    <span className="font-mono">{selectedPatronId}</span> — choose available books,
                                    then Assign.
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
                            disabled={
                                borrowSaving || !selectedPatronId || pickedShelfIds.length === 0
                            }
                            onClick={() => void handleAssignBooksToPatron()}
                            className="shrink-0 rounded-lg bg-stone-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-amber-700 dark:hover:bg-amber-600"
                        >
                            {borrowSaving ? 'Saving…' : 'Assign to selected user'}
                        </button>
                        <button
                            type="button"
                            disabled={borrowSaving || pickedBorrowedIds.length === 0}
                            onClick={() => void handleClearBorrowersForSelectedBooks()}
                            className="rounded-lg border border-stone-300 px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
                        >
                            Clear borrower for selected books
                        </button>
                    </div>

                    <div className="flex items-center justify-end border-b border-stone-200 pb-3 dark:border-stone-700">
                        <button
                            type="button"
                            onClick={() => void loadBooks()}
                            disabled={booksLoading}
                            className="text-sm font-medium text-amber-800 underline underline-offset-2 hover:text-amber-900 disabled:no-underline disabled:opacity-50 dark:text-amber-500 dark:hover:text-amber-400"
                        >
                            Refresh books
                        </button>
                    </div>

                    <div>
                        <div className="mb-4">
                            <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-600 dark:text-stone-800">
                                Available on shelf (
                                {booksLoading ? '…' : shelfBooks.length})
                            </h2>
                            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                                Only titles not currently linked to a patron.
                            </p>
                        </div>

                        {booksLoading ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">Loading…</p>
                        ) : shelfBooks.length === 0 ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">
                                {books.length === 0
                                    ? 'No books in the library yet.'
                                    : 'All copies are on loan.'}
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
                                                onChange={() => toggleBookSelect(b.id)}
                                                aria-label={`Select ${b.title}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-stone-900 dark:text-stone-100">
                                                    {b.title}
                                                </p>
                                                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                                                    {b.author}
                                                </p>
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
                                Select here to return books (clear borrower). Use View to see full patron details.
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
                                        onClick={closeLoanBookDetail}
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
                                            <span className="text-stone-600 dark:text-stone-400">
                                                {' '}
                                                — {loanDetailBook.author}
                                            </span>
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
                                                        {loanDetailBook.libraryUser.name}{' '}
                                                        {loanDetailBook.libraryUser.surname}
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
                                    <p className="text-sm text-stone-500 dark:text-stone-400">
                                        No book found for this id.
                                    </p>
                                )}
                            </section>
                        ) : null}

                        {booksLoading ? null : borrowedBooks.length === 0 ? (
                            <p className="text-sm text-stone-500 dark:text-stone-400">Nothing on loan.</p>
                        ) : (
                            <ul className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white dark:divide-stone-700 dark:border-stone-700 dark:bg-stone-900">
                                {borrowedBooks.map((b) => {
                                    const sid = String(b.id);
                                    return (
                                        <li
                                            key={b.id}
                                            className="flex items-start gap-3 px-4 py-4 first:rounded-t-xl last:rounded-b-xl"
                                        >
                                            <input
                                                type="checkbox"
                                                className="mt-1 h-4 w-4 shrink-0 rounded border-stone-400 text-amber-700"
                                                checked={!!selectedBookIds[sid]}
                                                onChange={() => toggleBookSelect(b.id)}
                                                aria-label={`Select borrowed ${b.title}`}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="font-medium text-stone-900 dark:text-stone-100">
                                                    {b.title}
                                                </p>
                                                <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                                                    {b.author}
                                                </p>
                                                <p className="mt-1 text-xs">
                                                    <span className="text-stone-400 dark:text-stone-500">Borrowed by </span>
                                                    <span className="text-stone-600 dark:text-stone-400">
                                                        {b.libraryUser.name} {b.libraryUser.surname}
                                                    </span>
                                                </p>
                                                <p className="mt-1 font-mono text-xs text-stone-400 dark:text-stone-500">
                                                    id {b.id}
                                                </p>
                                            </div>
                                            <div className="shrink-0">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleViewLoanBook(b.id)}
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
            ) : null}
        </div>
    );
}
