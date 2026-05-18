import AddLibraryUserForm from './AddLibraryUserForm.jsx';
import LibraryUserEditPanel from './LibraryUserEditPanel.jsx';
import LibraryUserList from './LibraryUserList.jsx';
import LibraryUserViewPanel from './LibraryUserViewPanel.jsx';

/**
 * Users tab: add patron, view/edit panels, list (controlled from LibraryApp).
 */
export default function LibraryUserPanel({
    userName,
    userSurname,
    userEmail,
    onUserNameChange,
    onUserSurnameChange,
    onUserEmailChange,
    onCreateUser,
    savingUser,
    viewingUserId,
    onCloseUserDetail,
    detailUser,
    detailUserLoading,
    detailUserError,
    editingUserId,
    editUserName,
    editUserSurname,
    editUserEmail,
    onEditUserNameChange,
    onEditUserSurnameChange,
    onEditUserEmailChange,
    onCancelUserEdit,
    onUpdateUser,
    updateUserSaving,
    libraryUsers,
    usersLoading,
    onRefreshUsers,
    onViewUser,
    onEditUserOpen,
    onDeleteUser,
}) {
    return (
        <>
            <AddLibraryUserForm
                name={userName}
                surname={userSurname}
                email={userEmail}
                savingUser={savingUser}
                onNameChange={onUserNameChange}
                onSurnameChange={onUserSurnameChange}
                onEmailChange={onUserEmailChange}
                onSubmit={onCreateUser}
            />

            {viewingUserId ? (
                <LibraryUserViewPanel
                    onClose={onCloseUserDetail}
                    detailUser={detailUser}
                    detailLoading={detailUserLoading}
                    detailError={detailUserError}
                />
            ) : null}

            {editingUserId ? (
                <LibraryUserEditPanel
                    editingId={editingUserId}
                    name={editUserName}
                    surname={editUserSurname}
                    email={editUserEmail}
                    onNameChange={onEditUserNameChange}
                    onSurnameChange={onEditUserSurnameChange}
                    onEmailChange={onEditUserEmailChange}
                    onSubmit={onUpdateUser}
                    onCancel={onCancelUserEdit}
                    saving={updateUserSaving}
                />
            ) : null}

            <LibraryUserList
                users={libraryUsers}
                loading={usersLoading}
                onRefresh={onRefreshUsers}
                onViewUser={onViewUser}
                onEditUser={onEditUserOpen}
                onDeleteUser={onDeleteUser}
            />
        </>
    );
}
