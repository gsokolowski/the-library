import { useEffect, useRef, useState } from 'react';
import AddBookForm from './components/books/AddBookForm.jsx';
import BookEditPanel from './components/books/BookEditPanel.jsx';
import BookList from './components/books/BookList.jsx';
import BookViewPanel from './components/books/BookViewPanel.jsx';
import AppHeader from './components/layout/AppHeader.jsx';
import PrimaryTabs from './components/layout/PrimaryTabs.jsx';
import LibraryLoansTab from './components/library/LibraryLoansTab.jsx';
import LibraryUserPanel from './components/library-users/LibraryUserPanel.jsx';
import { useBooks } from './hooks/useBooks.js';
import { useLibraryUsers } from './hooks/useLibraryUsers.js';
import { useLoanDesk } from './hooks/useLoanDesk.js';

export default function LibraryApp() {
    const [activeTab, setActiveTab] = useState('books');
    const [error, setError] = useState(null);

    const loanDeskGetterRef = useRef(() => ({
        selectedPatronId: null,
        setSelectedPatronId: () => {},
    }));

    const books = useBooks(setError);
    const users = useLibraryUsers(setError, books.loadBooks, () => loanDeskGetterRef.current());

    const loan = useLoanDesk({
        setError,
        books: books.books,
        loadBooks: books.loadBooks,
        libraryUsers: users.libraryUsers,
    });

    loanDeskGetterRef.current = () => ({
        selectedPatronId: loan.selectedPatronId,
        setSelectedPatronId: loan.setSelectedPatronId,
    });

    useEffect(() => {
        if (activeTab === 'users' || activeTab === 'library') {
            void users.loadLibraryUsers();
        }
    }, [activeTab, users.loadLibraryUsers]);

    function switchTab(tab) {
        setActiveTab(tab);
        setError(null);
        if (tab !== 'library') {
            loan.closeLoanBookDetail();
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <AppHeader />
            <PrimaryTabs activeTab={activeTab} onTabChange={switchTab} />

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
                    <AddBookForm
                        title={books.title}
                        author={books.author}
                        savingBook={books.savingBook}
                        onTitleChange={books.setTitle}
                        onAuthorChange={books.setAuthor}
                        onSubmit={books.handleCreateBook}
                    />

                    {books.viewingBookId ? (
                        <BookViewPanel
                            onClose={books.closeBookDetail}
                            detailBook={books.detailBook}
                            detailLoading={books.detailBookLoading}
                            detailError={books.detailBookError}
                        />
                    ) : null}

                    {books.editingBookId ? (
                        <BookEditPanel
                            editingId={books.editingBookId}
                            editTitle={books.editTitle}
                            editAuthor={books.editAuthor}
                            onEditTitleChange={books.setEditTitle}
                            onEditAuthorChange={books.setEditAuthor}
                            onSubmit={books.handleUpdateBook}
                            onCancel={books.closeBookEdit}
                            saving={books.updateBookSaving}
                        />
                    ) : null}

                    <BookList
                        books={books.books}
                        loading={books.booksLoading}
                        onRefresh={() => void books.loadBooks()}
                        onViewBook={(id) => void books.handleViewBook(id)}
                        onEditBook={books.handleEditBookOpen}
                        onDeleteBook={(id) => void books.handleDeleteBook(id)}
                    />
                </>
            ) : null}

            {activeTab === 'users' ? (
                <LibraryUserPanel
                    userName={users.userName}
                    userSurname={users.userSurname}
                    userEmail={users.userEmail}
                    onUserNameChange={users.setUserName}
                    onUserSurnameChange={users.setUserSurname}
                    onUserEmailChange={users.setUserEmail}
                    onCreateUser={users.handleCreateUser}
                    savingUser={users.savingUser}
                    viewingUserId={users.viewingUserId}
                    onCloseUserDetail={users.closeUserDetail}
                    detailUser={users.detailUser}
                    detailUserLoading={users.detailUserLoading}
                    detailUserError={users.detailUserError}
                    editingUserId={users.editingUserId}
                    editUserName={users.editUserName}
                    editUserSurname={users.editUserSurname}
                    editUserEmail={users.editUserEmail}
                    onEditUserNameChange={users.setEditUserName}
                    onEditUserSurnameChange={users.setEditUserSurname}
                    onEditUserEmailChange={users.setEditUserEmail}
                    onCancelUserEdit={users.closeUserEdit}
                    onUpdateUser={users.handleUpdateUser}
                    updateUserSaving={users.updateUserSaving}
                    libraryUsers={users.libraryUsers}
                    usersLoading={users.usersLoading}
                    onRefreshUsers={() => void users.loadLibraryUsers()}
                    onViewUser={(id) => void users.handleViewUser(id)}
                    onEditUserOpen={users.handleEditUserOpen}
                    onDeleteUser={(id) => void users.handleDeleteUser(id)}
                />
            ) : null}

            {activeTab === 'library' ? (
                <LibraryLoansTab
                    books={books.books}
                    booksLoading={books.booksLoading}
                    usersLoading={users.usersLoading}
                    userSearch={loan.userSearch}
                    onUserSearchChange={loan.setUserSearch}
                    filteredPatrons={loan.filteredPatrons}
                    selectedPatronId={loan.selectedPatronId}
                    setSelectedPatronId={loan.setSelectedPatronId}
                    borrowSaving={loan.borrowSaving}
                    pickedShelfIds={loan.pickedShelfIds}
                    pickedBorrowedIds={loan.pickedBorrowedIds}
                    onAssign={loan.handleAssignBooksToPatron}
                    onClearBorrowers={loan.handleClearBorrowersForSelectedBooks}
                    onRefreshBooks={() => void books.loadBooks()}
                    shelfBooks={loan.shelfBooks}
                    borrowedBooks={loan.borrowedBooks}
                    selectedBookIds={loan.selectedBookIds}
                    onToggleBookSelect={loan.toggleBookSelect}
                    viewingLoanBookId={loan.viewingLoanBookId}
                    loanDetailBook={loan.loanDetailBook}
                    loanDetailLoading={loan.loanDetailLoading}
                    loanDetailError={loan.loanDetailError}
                    onCloseLoanDetail={loan.closeLoanBookDetail}
                    onViewLoanBook={(id) => void loan.handleViewLoanBook(id)}
                />
            ) : null}
        </div>
    );
}
