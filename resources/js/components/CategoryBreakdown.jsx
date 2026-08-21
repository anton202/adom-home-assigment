import { cn } from '../lib/cn';
import { formatCategory, formatCount, formatCurrency } from '../lib/format';
import Card from './ui/Card';

/**
 * Stands in until the summary hook lands. Keyed exactly like the `by_category`
 * array of the `GET /api/transactions/summary` response, so wiring the real
 * figures up is a matter of passing `breakdown` — the rows below never change.
 *
 * The counts and amounts add up to the `SummaryTiles` mock (237 · $11,662.40),
 * so the two panels tell the same story while both are running on mock data.
 */
const MOCK_BREAKDOWN = [
    { category: 'groceries', count: 61, total_amount: 4120.55 },
    { category: 'travel', count: 38, total_amount: 2880.1 },
    { category: 'utilities', count: 33, total_amount: 1940.0 },
    { category: 'dining', count: 29, total_amount: 1405.75 },
    { category: 'shopping', count: 41, total_amount: 832.4 },
    { category: 'health', count: 21, total_amount: 305.6 },
    { category: 'entertainment', count: 14, total_amount: 178.0 },
];

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
 * the panel the same size whatever the filters match:
 *
 *     <CategoryBreakdown breakdown={summary.by_category} loading={summary.loading} />
 *
 * @param {{ breakdown?: typeof MOCK_BREAKDOWN, loading?: boolean, className?: string }} props
 */
export default function CategoryBreakdown({
    breakdown = MOCK_BREAKDOWN,
    loading = false,
    className,
}) {
    const rows = [...breakdown].sort((a, b) => b.total_amount - a.total_amount);

    return (
        <Card className={className} aria-busy={loading || undefined}>
            <h2 className="text-base font-semibold text-gray-900">Category breakdown</h2>
            <p className="mt-0.5 text-sm text-gray-500">Totals for the applied filters</p>

            {loading ? (
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
 * @param {typeof MOCK_BREAKDOWN[number]} props
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
