import { buildQuery } from '../lib/query';
import { useApiResource } from './useApiResource';

/**
 * The page of transactions matching the applied filters.
 *
 * Sorting and pagination are not sent yet, so the endpoint's own defaults apply
 * — `occurred_at` descending, page 1, 20 per page. `meta` still comes from the
 * response rather than being assumed, so the footer reports the real position
 * in the real result set.
 *
 * @param {Record<string, string>} filters keyed as `TransactionFilterRequest` expects
 * @returns {{ transactions: Array<object>, meta: object|null, loading: boolean, error: string|null, reload: () => void }}
 */
export function useTransactions(filters) {
    const { data, loading, error, reload } = useApiResource(`/api/transactions${buildQuery(filters)}`);

    return {
        transactions: data?.data ?? [],
        meta: data?.meta ?? null,
        loading,
        error,
        reload,
    };
}
