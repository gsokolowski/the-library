import { tabBtn } from '../ui/styles.js';

/**
 * @param {{ activeTab: 'books' | 'users' | 'library'; onTabChange: (tab: 'books' | 'users' | 'library') => void }} props
 */
export default function PrimaryTabs({ activeTab, onTabChange }) {
    return (
        <nav className="flex flex-wrap gap-1" aria-label="Primary">
            <button type="button" className={tabBtn(activeTab === 'books')} onClick={() => onTabChange('books')}>
                Books
            </button>
            <button type="button" className={tabBtn(activeTab === 'users')} onClick={() => onTabChange('users')}>
                Users
            </button>
            <button type="button" className={tabBtn(activeTab === 'library')} onClick={() => onTabChange('library')}>
                Library
            </button>
        </nav>
    );
}
