import { useEffect, useRef } from 'react';
import { buildQuery } from '../lib/query';
import { useApiResource } from './useApiResource';

/**
 * The page of transactions matching the applied filters, in the requested order.
 *
 * The sort and the pagination are always sent, even when they are what the
 * endpoint would have chosen anyway, so the URL states the slice it is showing
 * rather than implying it. That URL is what {@link useApiResource} keys its
 * effect on, so picking a new column or stepping a page refetches and abandons
 * the request for the previous one.
 *
 * `meta` describes the page that arrived, and the last one is held while the next
 * is in flight: the request in progress has nulled the body it will replace, and
 * a footer that blanked its total on every step would report "of 1" between
 * pages. It is dropped on an error, where there is no page to describe.
 *
 * @param {Record<string, string>} filters keyed as `TransactionFilterRequest` expects
 * @param {{ column: string, direction: string }} sort keyed as `TransactionSort` allows
 * @param {number} page
 * @param {number} perPage within `IndexTransactionRequest::MAX_PER_PAGE`
 * @returns {{ transactions: Array<object>, meta: object|null, loading: boolean, error: string|null, reload: () => void }}
 */
export function useTransactions(filters, sort, page, perPage) {
    const query = buildQuery({
        ...filters,
        sort: sort.column,
        direction: sort.direction,
        page,
        per_page: perPage,
    });

    const { data, loading, error, reload } = useApiResource(`/api/transactions${query}`);

    /** The `meta` of the last response, standing in while the next one loads. */
    const lastMeta = useRef(null);

    useEffect(() => {
        if (data?.meta) {
            lastMeta.current = data.meta;
        }
    }, [data]);

    return {
        transactions: data?.data ?? [],
        meta: error ? null : (data?.meta ?? lastMeta.current),
        loading,
        error,
        reload,
    };
}
