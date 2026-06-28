import { useCallback, useState } from 'react';
import { graphqlRequest } from '../graphqlClient.js';
import {
    CREATE_LIBRARY_USER_MUTATION,
    DELETE_LIBRARY_USER_MUTATION,
    LIBRARY_USERS_QUERY,
    LIBRARY_USER_QUERY,
    SET_BOOK_LIBRARY_USER_MUTATION,
    UPDATE_LIBRARY_USER_MUTATION,
} from '../queries.js';

/**
 * @param {React.Dispatch<React.SetStateAction<string | null>>} setError
 * @param {() => Promise<void>} loadBooks
 * @param {() => { selectedPatronId: string | null; setSelectedPatronId: React.Dispatch<React.SetStateAction<string | null>> }} getLoanDesk
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
    }

    function closeUserEdit() {
        setEditingUserId(null);
        setEditUserName('');
        setEditUserSurname('');
        setEditUserEmail('');
        setUpdateUserSaving(false);
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
            const { selectedPatronId, setSelectedPatronId } = getLoanDesk();
            if (selectedPatronId === String(id)) {
                setSelectedPatronId(null);
            }
            await loadLibraryUsers();
            await loadBooks();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not delete patron');
        }
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

    async function handleReturnBorrowedBook(bookId) {
        const patronId = viewingUserId;
        if (!patronId) {
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
            const data = await graphqlRequest(LIBRARY_USER_QUERY, { id: patronId });
            setDetailUser(data.libraryUser ?? null);
            await loadLibraryUsers();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Could not return book');
        } finally {
            setReturningBookId(null);
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
            setError(err instanceof Error ? err.message : 'Could not update patron');
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
    };
}
