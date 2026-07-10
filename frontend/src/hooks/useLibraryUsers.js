import { useCallback, useRef, useState } from 'react';
import { graphqlRequest } from '../graphqlClient.js';
import {
    CREATE_LIBRARY_USER_MUTATION,
    DELETE_LIBRARY_USER_MUTATION,
    JOIN_BOOK_WAITLIST_MUTATION,
    LEAVE_BOOK_WAITLIST_MUTATION,
    LIBRARY_USERS_QUERY,
    LIBRARY_USER_QUERY,
    MARK_NOTIFICATIONS_READ_MUTATION,
    SET_BOOK_LIBRARY_USER_MUTATION,
    UPDATE_LIBRARY_USER_MUTATION,
} from '../queries.js';

const lastSeenStorageKey = (libraryUserId) => `library.notifications.lastSeen.${libraryUserId}`;

/**
 * @param {React.Dispatch<React.SetStateAction<string | null>>} setError
 * @param {() => Promise<void>} loadBooks
 * @param {() => { selectedLibraryUserId: string | null; setSelectedLibraryUserId: React.Dispatch<React.SetStateAction<string | null>> }} getLoanDesk
 */
export function useLibraryUsers(setError, loadBooks, getLoanDesk) {
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
    const [returningBookId, setReturningBookId] = useState(null);
    const [leavingWaitlistBookId, setLeavingWaitlistBookId] = useState(null);
    const [markingNotificationId, setMarkingNotificationId] = useState(null);
    const [notificationToast, setNotificationToast] = useState(null);

    const toastShownForUserRef = useRef(null);

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
    }, [setError]);

    function closeUserDetail() {
        setViewingUserId(null);
        setDetailUser(null);
        setDetailUserLoading(false);
        setDetailUserError(null);
        setReturningBookId(null);
        setLeavingWaitlistBookId(null);
        setMarkingNotificationId(null);
        toastShownForUserRef.current = null;
    }

    function closeUserEdit() {
        setEditingUserId(null);
        setEditUserName('');
        setEditUserSurname('');
        setEditUserEmail('');
        setUpdateUserSaving(false);
    }

    function maybeShowNotificationToast(libraryUserId, notifications) {
        if (toastShownForUserRef.current === libraryUserId) {
            return;
        }

        const unread = (notifications ?? []).filter((n) => !n.read_at);
        if (!unread.length) {
            return;
        }

        const lastSeenRaw = localStorage.getItem(lastSeenStorageKey(libraryUserId));
        const lastSeenMs = lastSeenRaw ? Date.parse(lastSeenRaw) : 0;
        const fresh = unread.filter((n) => Date.parse(n.created_at) > lastSeenMs);
        const toShow = fresh.length ? fresh : unread;

        toastShownForUserRef.current = libraryUserId;
        setNotificationToast({
            libraryUserId,
            notificationId: String(toShow[0].id),
            message: toShow[0].body,
        });
    }

    async function dismissNotificationToast() {
        if (!notificationToast) {
            return;
        }

        const { libraryUserId, notificationId } = notificationToast;
        setNotificationToast(null);

        try {
            await graphqlRequest(MARK_NOTIFICATIONS_READ_MUTATION, {
                ids: [notificationId],
            });
            localStorage.setItem(lastSeenStorageKey(libraryUserId), new Date().toISOString());
            if (viewingUserId === libraryUserId) {
                const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: libraryUserId });
                setDetailUser(data.libraryUser ?? null);
            }
        } catch {
            // Toast already dismissed; inbox still shows unread items.
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
            setError(err instanceof Error ? err.message : 'Could not create library user');
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
            const { selectedLibraryUserId, setSelectedLibraryUserId } = getLoanDesk();
            if (selectedLibraryUserId === String(id)) {
                setSelectedLibraryUserId(null);
            }
            await loadLibraryUsers();
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete library user');
        }
    }

    async function handleViewUser(id) {
        const sid = String(id);
        setViewingUserId(sid);
        setDetailUser(null);
        setDetailUserLoading(true);
        setDetailUserError(null);
        toastShownForUserRef.current = null;
        try {
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: sid });
            const user = data.libraryUser ?? null;
            setDetailUser(user);
            if (user) {
                maybeShowNotificationToast(sid, user.notifications);
            }
        } catch (err) {
            setDetailUserError(err instanceof Error ? err.message : 'Could not load library user');
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

    async function handleReturnBorrowedBook(bookId) {
        const libraryUserId = viewingUserId;
        if (!libraryUserId) {
            return;
        }
        setError(null);
        setDetailUserError(null);
        setReturningBookId(String(bookId));
        try {
            await graphqlRequest(SET_BOOK_LIBRARY_USER_MUTATION, {
                id: String(bookId),
                libraryUserId: null,
            });
            await loadBooks();
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: libraryUserId });
            setDetailUser(data.libraryUser ?? null);
            await loadLibraryUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not return book');
        } finally {
            setReturningBookId(null);
        }
    }

    async function handleLeaveWaitlist(bookId) {
        const libraryUserId = viewingUserId;
        if (!libraryUserId) {
            return;
        }
        setError(null);
        setDetailUserError(null);
        setLeavingWaitlistBookId(String(bookId));
        try {
            await graphqlRequest(LEAVE_BOOK_WAITLIST_MUTATION, {
                bookId: String(bookId),
                libraryUserId,
            });
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: libraryUserId });
            setDetailUser(data.libraryUser ?? null);
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not leave waitlist');
        } finally {
            setLeavingWaitlistBookId(null);
        }
    }

    async function handleMarkNotificationRead(notificationId) {
        const libraryUserId = viewingUserId;
        if (!libraryUserId) {
            return;
        }
        setMarkingNotificationId(notificationId);
        setError(null);
        try {
            await graphqlRequest(MARK_NOTIFICATIONS_READ_MUTATION, { ids: [notificationId] });
            localStorage.setItem(lastSeenStorageKey(libraryUserId), new Date().toISOString());
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: libraryUserId });
            setDetailUser(data.libraryUser ?? null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not mark notification read');
        } finally {
            setMarkingNotificationId(null);
        }
    }

    async function handleJoinWaitlist(bookId, libraryUserId) {
        setError(null);
        try {
            await graphqlRequest(JOIN_BOOK_WAITLIST_MUTATION, {
                bookId: String(bookId),
                libraryUserId: String(libraryUserId),
            });
            await loadBooks();
            if (viewingUserId === String(libraryUserId)) {
                const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: String(libraryUserId) });
                setDetailUser(data.libraryUser ?? null);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not join waitlist');
            throw err;
        }
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
            setError(err instanceof Error ? err.message : 'Could not update library user');
        } finally {
            setUpdateUserSaving(false);
        }
    }

    return {
        libraryUsers,
        usersLoading,
        userName,
        userSurname,
        userEmail,
        setUserName,
        setUserSurname,
        setUserEmail,
        savingUser,
        viewingUserId,
        detailUser,
        detailUserLoading,
        detailUserError,
        editingUserId,
        editUserName,
        editUserSurname,
        editUserEmail,
        setEditUserName,
        setEditUserSurname,
        setEditUserEmail,
        updateUserSaving,
        loadLibraryUsers,
        closeUserDetail,
        closeUserEdit,
        handleCreateUser,
        handleDeleteUser,
        handleViewUser,
        handleEditUserOpen,
        handleUpdateUser,
        handleReturnBorrowedBook,
        returningBookId,
        handleLeaveWaitlist,
        leavingWaitlistBookId,
        handleMarkNotificationRead,
        markingNotificationId,
        handleJoinWaitlist,
        notificationToast,
        dismissNotificationToast,
    };
}
