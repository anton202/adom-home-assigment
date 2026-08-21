import { useApiResource } from './useApiResource';
import { formatCategory } from '../lib/format';

/**
 * The categories present in the data, ready to hand to a `Select`.
 *
 * The endpoint returns bare slugs (`groceries`); the label is built here so no
 * call site ever has to think about presenting a raw value.
 *
 * @returns {{ options: Array<{ value: string, label: string }>, loading: boolean, error: string|null, reload: () => void }}
 */
export function useCategories() {
    const { data, loading, error, reload } = useApiResource('/api/categories');

    return {
        options: (data?.data ?? []).map(toOption),
        loading,
        error,
        reload,
    };
}

/**
 * @param {string} category
 * @returns {{ value: string, label: string }}
 */
function toOption(category) {
    return {
        value: category,
        label: formatCategory(category),
    };
}
