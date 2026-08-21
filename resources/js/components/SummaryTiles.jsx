import { cn } from '../lib/cn';
import { formatCount, formatCurrency } from '../lib/format';
import StatTile from './ui/StatTile';

/**
 * Stands in until the summary hook lands. Keyed exactly like the
 * `GET /api/transactions/summary` response, so wiring the real figures up is a
 * matter of passing `summary` — the tiles below never change.
 */
const MOCK_SUMMARY = {
    total_count: 237,
    total_amount: 11662.4,
};

/**
 * The headline figures for the transactions matching the applied filters. Two
 * tiles side by side from `sm` up, stacked below it.
 *
 * The `error` the summary request failed with is handed to both tiles, since one
 * request is behind both figures. The retry for it lives on `CategoryBreakdown`,
 * which is fed by the same endpoint.
 *
 * @param {{ summary?: typeof MOCK_SUMMARY, loading?: boolean, error?: string|boolean, className?: string }} props
 */
export default function SummaryTiles({
    summary = MOCK_SUMMARY,
    loading = false,
    error = null,
    className,
}) {
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
