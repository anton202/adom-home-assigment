import { useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * Example component — fetches the example endpoint and renders the result.
 * Delete or repurpose it once your dashboard is in place.
 */
export default function CategoryChips() {
    const [categories, setCategories] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        let cancelled = false;

        api('/api/categories')
            .then((res) => !cancelled && setCategories(res.data))
            .catch((err) => !cancelled && setError(err.message));

        return () => {
            cancelled = true;
        };
    }, []);

    if (error) return <p className="text-red-600">Failed to load categories: {error}</p>;
    if (!categories) return <p className="text-gray-400">Loading…</p>;

    return (
        <ul className="flex flex-wrap gap-2">
            {categories.map((category) => (
                <li
                    key={category}
                    className="rounded-full bg-indigo-100 px-3 py-1 text-sm text-indigo-800"
                >
                    {category}
                </li>
            ))}
        </ul>
    );
}
