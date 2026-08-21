import { useState } from 'react';
import { useTransactions } from '../hooks/useTransactions';
import { useTransactionSummary } from '../hooks/useTransactionSummary';
import CategoryBreakdown from './CategoryBreakdown';
import FiltersPanel, { EMPTY_FILTERS } from './FiltersPanel';
import SummaryTiles from './SummaryTiles';
import TransactionsTable from './TransactionsTable';

/**
 * The dashboard. It owns one piece of state — the filters the user has applied
 * — and both requests read from it, which is what keeps the table and the
 * summary describing the same set of transactions.
 *
 * The two endpoints are fetched independently and so fail independently: a
 * failed summary leaves the table alone, and each panel carries its own retry.
 */
export default function App() {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const transactions = useTransactions(filters);
    const summary = useTransactionSummary(filters);

    return (
        <div className="mx-auto max-w-5xl p-8">
            <h1 className="text-2xl font-semibold text-gray-900">Transactions Dashboard</h1>
            <div className="mt-6 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
                <div className="flex flex-col gap-6">
                    <FiltersPanel onApply={setFilters} onReset={() => setFilters(EMPTY_FILTERS)} />
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
                        page={transactions.meta?.current_page}
                        pageCount={transactions.meta?.last_page}
                        perPage={transactions.meta?.per_page}
                    />
                </div>
            </div>
        </div>
    );
}
