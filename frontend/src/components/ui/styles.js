/** Shared Tailwind class strings for form controls and tabs. */

export function tabBtn(active) {
    return `rounded-t-lg border border-b-0 px-4 py-2 text-sm font-medium transition ${
        active
            ? 'border-stone-300 bg-white text-stone-900 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100'
            : 'border-transparent text-stone-600 hover:bg-stone-100 dark:text-stone-400 dark:hover:bg-stone-800'
    }`;
}

export const inputClass =
    'rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-stone-900 outline-none ring-amber-600/40 focus:border-amber-700 focus:ring-2 dark:border-stone-600 dark:bg-stone-950 dark:text-stone-100';
