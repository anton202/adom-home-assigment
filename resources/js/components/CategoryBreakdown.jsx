import { cn } from '../lib/cn';
import { formatCategory, formatCount, formatCurrency } from '../lib/format';
import Card from './ui/Card';
import ErrorState from './ui/ErrorState';

/** The scroll height of the list, and of the placeholder that stands in for it. */
const LIST_HEIGHT = 'h-56';

/** Enough placeholder rows to fill {@link LIST_HEIGHT}; the rest is clipped. */
const SKELETON_ROWS = 6;

/**
 * Where the money went, one row per category. Display only — the category
 * filter lives in the filters panel, so a row is never clickable.
 *
 * The API returns every known category alphabetically and zero-filled; the panel
 * is about relative size, so the rows are re-sorted by amount here rather than
 * asking the endpoint for a second ordering.
 *
 * The list scrolls at a fixed height instead of growing the card, which keeps
 * the panel the same size whatever the filters match.
 *
 * This panel carries the retry for the summary request. The tiles above it are
 * fed by the same endpoint, so putting a Retry button on each of them would ask
 * the user to choose between three buttons that all do the same thing.
 *
 * @param {{ breakdown?: Array<{ category: string, count: number, total_amount: number }>, loading?: boolean, error?: string|boolean, onRetry?: () => void, className?: string }} props
 */
export default function CategoryBreakdown({
    breakdown = [],
    loading = false,
    error = null,
    onRetry,
    className,
}) {
    const rows = [...breakdown].sort((a, b) => b.total_amount - a.total_amount);

    return (
        <Card className={className} aria-busy={(loading && !error) || undefined}>
            <h2 className="text-base font-semibold text-gray-900">Category breakdown</h2>
            <p className="mt-0.5 text-sm text-gray-500">Totals for the applied filters</p>

            {error ? (
                <div className={cn('mt-3', LIST_HEIGHT)}>
                    <ErrorState
                        title="Couldn't load the breakdown"
                        message={error}
                        onRetry={onRetry}
                    />
                </div>
            ) : loading ? (
                <CategorySkeleton />
            ) : rows.length === 0 ? (
                <p className="mt-3 py-2 text-sm text-gray-500">No categories match these filters.</p>
            ) : (
                <dl className={cn('mt-3 overflow-y-auto', LIST_HEIGHT)}>
                    {rows.map((row) => (
                        <CategoryRow key={row.category} {...row} />
                    ))}
                </dl>
            )}
        </Card>
    );
}

/**
 * A single category and its figures. The pair is marked up as `<dt>`/`<dd>` for
 * the same reason {@link StatTile} is: on screen the relationship is carried by
 * position, and the description list is what carries it to assistive tech.
 *
 * @param {{ category: string, count: number, total_amount: number }} props
 */
function CategoryRow({ category, count, total_amount: totalAmount }) {
    return (
        <div className="flex items-baseline justify-between gap-4 py-2">
            <dt className="min-w-0 truncate text-sm text-gray-700">{formatCategory(category)}</dt>
            <dd className="shrink-0 text-sm tabular-nums text-gray-500">
                {formatCount(count)}
                <span className="px-1.5 text-gray-300" aria-hidden="true">
                    ·
                </span>
                <span className="font-medium text-gray-900">{formatCurrency(totalAmount)}</span>
            </dd>
        </div>
    );
}

/**
 * Placeholder bars filling the same fixed height the list occupies, so the panel
 * does not resize or shift when the real figures arrive.
 */
function CategorySkeleton() {
    return (
        <div className={cn('mt-3 overflow-hidden', LIST_HEIGHT)} aria-hidden="true">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <div key={index} className="flex items-center justify-between gap-4 py-2">
                    <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                    <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
                </div>
            ))}
        </div>
    );
}
