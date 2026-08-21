import { buildQuery } from '../lib/query';
import { useApiResource } from './useApiResource';

/**
 * The page of transactions matching the applied filters, in the requested order.
 *
 * The sort is always sent, even when it is the one the endpoint would have
 * chosen anyway, so the URL states the order it is showing rather than implying
 * it. That URL is what {@link useApiResource} keys its effect on, so picking a
 * new column refetches and abandons the request for the previous one.
 *
 * Pagination is not sent yet, so the endpoint's own defaults apply — page 1, 20
 * per page. `meta` still comes from the response rather than being assumed, so
 * the footer reports the real position in the real result set.
 *
 * @param {Record<string, string>} filters keyed as `TransactionFilterRequest` expects
 * @param {{ column: string, direction: string }} sort keyed as `TransactionSort` allows
 * @returns {{ transactions: Array<object>, meta: object|null, loading: boolean, error: string|null, reload: () => void }}
 */
export function useTransactions(filters, sort) {
    const query = buildQuery({ ...filters, sort: sort.column, direction: sort.direction });
    const { data, loading, error, reload } = useApiResource(`/api/transactions${query}`);

    return {
        transactions: data?.data ?? [],
        meta: data?.meta ?? null,
        loading,
        error,
        reload,
    };
}
