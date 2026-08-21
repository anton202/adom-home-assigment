import { cn } from '../lib/cn';
import { formatCount, formatCurrency } from '../lib/format';
import StatTile from './ui/StatTile';

/**
 * The headline figures for the transactions matching the applied filters. Two
 * tiles side by side from `sm` up, stacked below it.
 *
 * `summary` is keyed like the `GET /api/transactions/summary` response and is
 * read unconditionally — `useTransactionSummary` guarantees the shape even
 * while the request is in flight or has failed, states in which the tiles show
 * a skeleton or "Unavailable" rather than these figures.
 *
 * The `error` the summary request failed with is handed to both tiles, since one
 * request is behind both figures. The retry for it lives on `CategoryBreakdown`,
 * which is fed by the same endpoint.
 *
 * @param {{ summary: { total_count: number, total_amount: number }, loading?: boolean, error?: string|boolean, className?: string }} props
 */
export default function SummaryTiles({ summary, loading = false, error = null, className }) {
    return (
        <div className={cn('grid gap-4 sm:grid-cols-2', className)}>
            <StatTile
                label="Total transactions"
                value={formatCount(summary.total_count)}
                loading={loading}
                error={error}
            />
            <StatTile
                label="Total amount"
                value={formatCurrency(summary.total_amount)}
                loading={loading}
                error={error}
            />
        </div>
    );
}
