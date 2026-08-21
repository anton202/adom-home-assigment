import { buildQuery } from '../lib/query';
import { useApiResource } from './useApiResource';

/**
 * The headline figures and the per-category breakdown for the applied filters —
 * one request behind both the summary tiles and the breakdown panel, which is
 * why they share a `loading`, an `error` and a single `reload`.
 *
 * `summary` is never null: the tiles read `total_count` and `total_amount`
 * before they branch on `loading`, so an in-flight or failed request has to
 * hand them a shaped object. They do not show the zeroes — the skeleton and the
 * error state cover them — but they do read them.
 *
 * @param {Record<string, string>} filters keyed as `TransactionFilterRequest` expects
 * @returns {{ summary: { total_count: number, total_amount: number }, breakdown: Array<object>, loading: boolean, error: string|null, reload: () => void }}
 */
export function useTransactionSummary(filters) {
    const { data, loading, error, reload } = useApiResource(
        `/api/transactions/summary${buildQuery(filters)}`,
    );

    const summary = data?.data ?? null;

    return {
        summary: summary ? { total_count: summary.total_count, total_amount: summary.total_amount } : EMPTY_SUMMARY,
        breakdown: summary?.by_category ?? [],
        loading,
        error,
        reload,
    };
}

/** Stands in for the figures while there are none to show. */
const EMPTY_SUMMARY = { total_count: 0, total_amount: 0 };
