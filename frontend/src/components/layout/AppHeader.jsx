export default function AppHeader() {
    return (
        <header className="mb-6 border-b border-stone-200 pb-6 dark:border-stone-700">
            <h1 className="font-semibold tracking-tight text-3xl text-stone-900 dark:text-stone-600">
                Library
            </h1>
            <p className="mt-2 max-w-3xl text-[15px] text-stone-800 dark:text-stone-600">
                Manage books and patrons, then link borrowings on the Library tab (GraphQL API).
            </p>
        </header>
    );
}
