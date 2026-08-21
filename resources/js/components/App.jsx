import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionSummary } from '../hooks/useTransactionSummary';
import CategoryBreakdown from './CategoryBreakdown';
import FiltersPanel, { EMPTY_FILTERS } from './FiltersPanel';
import SummaryTiles from './SummaryTiles';
import TransactionsTable, { DEFAULT_PER_PAGE, DEFAULT_SORT } from './TransactionsTable';

/**
 * The dashboard. It owns the filters the user has applied, and both requests
 * read from them, which is what keeps the table and the summary describing the
 * same set of transactions.
 *
 * It also owns the table's sort and its place in the results, both kept apart
 * from the filters rather than folded in with them: ordering and page size are
 * view preferences, so they survive a change of filters, and the summary — which
 * aggregates the whole result set, and so has neither order nor pages — is not
 * refetched when a column header is clicked or a page is stepped.
 *
 * The page itself is the one thing a filter change resets. Narrowing the results
 * can leave the current page past the end of them, and an empty table under a
 * filter that matches plenty reads as a broken filter rather than as page 3 of
 * one page. Re-sorting cannot strand a page that way, so it keeps its place.
 *
 * The two endpoints are fetched independently and so fail independently: a
 * failed summary leaves the table alone, and each panel carries its own retry.
 */
export default function App() {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [sort, setSort] = useState(DEFAULT_SORT);
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(DEFAULT_PER_PAGE);
    const transactions = useTransactions(filters, sort, page, perPage);
    const summary = useTransactionSummary(filters);

    const applyFilters = (applied) => {
        setFilters(applied);
        setPage(1);
    };

    /**
     * A larger page holds the same rows in fewer pages, so the current one can
     * fall off the end of the result set. The last page it now has is worked out
     * from the total already in hand rather than by asking for a page that is not
     * there, so the request that follows is one the user can see the answer to.
     */
    const changePerPage = (nextPerPage) => {
        const total = transactions.meta?.total ?? 0;

        setPerPage(nextPerPage);
        setPage((current) => Math.min(current, Math.max(1, Math.ceil(total / nextPerPage))));
    };

    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-6">
                    <FiltersPanel
                        onApply={applyFilters}
                        onReset={() => applyFilters(EMPTY_FILTERS)}
                    />
                    <CategoryBreakdown
                        breakdown={summary.breakdown}
                        loading={summary.loading}
                        error={summary.error}
                        onRetry={summary.reload}
                    />
                </div>
                <div className="flex flex-col gap-6">
                    <SummaryTiles
                        summary={summary.summary}
                        loading={summary.loading}
                        error={summary.error}
                    />
                    <TransactionsTable
                        transactions={transactions.transactions}
                        loading={transactions.loading}
                        error={transactions.error}
                        onRetry={transactions.reload}
                        sort={sort}
                        onSortChange={setSort}
                        page={page}
                        pageCount={transactions.meta?.last_page}
                        perPage={perPage}
                        onPageChange={setPage}
                        onPerPageChange={changePerPage}
                    />
                </div>
            </div>
        </div>
    );
}
