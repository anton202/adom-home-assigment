import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { formatCategory } from '../lib/format';

/**
 * The categories present in the data, ready to hand to a `Select`.
 *
 * The endpoint returns bare slugs (`groceries`); the label is built here so no
 * call site ever has to think about presenting a raw value.
 *
 * @returns {{ options: Array<{ value: string, label: string }>, loading: boolean, error: string|null }}
 */
export function useCategories() {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        api('/api/categories')
            .then((response) => {
                if (cancelled) {
                    return;
                }

                setOptions(response.data.map(toOption));
                setLoading(false);
            })
            .catch((err) => {
                if (cancelled) {
                    return;
                }

                setError(err.message);
                setLoading(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return { options, loading, error };
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
