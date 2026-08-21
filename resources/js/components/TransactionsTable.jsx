import { cn } from '../lib/cn';
import { formatCategory, formatCount, formatCurrency, formatDate } from '../lib/format';
import Badge from './ui/Badge';
import Button from './ui/Button';
import Card from './ui/Card';
import ErrorState from './ui/ErrorState';
import Select from './ui/Select';
import { ArrowDownIcon, ArrowUpIcon, FlagIcon, SortIcon } from './ui/icons';

/**
 * Stands in until the listing hook lands. Rows are keyed exactly like the
 * `data` array of the `GET /api/transactions` response, so wiring the real page
 * up is a matter of passing `transactions` — the markup below never changes.
 *
 * Twelve pages of twenty matches the 237 transactions in the `SummaryTiles`
 * mock, so every panel on the dashboard tells the same story while all of them
 * are running on mock data.
 */
const MOCK_TRANSACTIONS = [
    {
        id: 1,
        occurred_at: '2026-08-18T14:05:00Z',
        merchant: 'Blue Bottle',
        category: 'dining',
        amount: 18.4,
        status: 'completed',
        flagged: false,
    },
    {
        id: 2,
        occurred_at: '2026-08-18T09:40:00Z',
        merchant: 'Northgate Market',
        category: 'groceries',
        amount: 126.05,
        status: 'pending',
        flagged: true,
    },
    {
        id: 3,
        occurred_at: '2026-08-17T18:22:00Z',
        merchant: 'City Transit',
        category: 'travel',
        amount: 2.75,
        status: 'completed',
        flagged: false,
    },
    {
        id: 4,
        occurred_at: '2026-08-16T11:00:00Z',
        merchant: 'Volt Energy',
        category: 'utilities',
        amount: 212,
        status: 'failed',
        flagged: false,
    },
    {
        id: 5,
        occurred_at: '2026-08-15T16:31:00Z',
        merchant: 'Rivera Hardware',
        category: 'shopping',
        amount: 64.9,
        status: 'completed',
        flagged: false,
    },
    {
        id: 6,
        occurred_at: '2026-08-15T10:12:00Z',
        merchant: 'Cedar Pharmacy',
        category: 'health',
        amount: 38.2,
        status: 'completed',
        flagged: false,
    },
    {
        id: 7,
        occurred_at: '2026-08-14T20:47:00Z',
        merchant: 'Lumen Cinema',
        category: 'entertainment',
        amount: 24,
        status: 'completed',
        flagged: false,
    },
    {
        id: 8,
        occurred_at: '2026-08-14T08:05:00Z',
        merchant: 'Harbor Coffee',
        category: 'dining',
        amount: 9.65,
        status: 'completed',
        flagged: false,
    },
];

/** Mirrors `TransactionSort` — the two columns the listing endpoint can order by. */
const DEFAULT_SORT = { column: 'occurred_at', direction: 'desc' };

/** Mirrors `IndexTransactionRequest::MAX_PER_PAGE`, which caps the page size at 100. */
const PER_PAGE_OPTIONS = [
    { value: '20', label: '20' },
    { value: '50', label: '50' },
    { value: '100', label: '100' },
];

/** The scroll height of the rows, and of the placeholder that stands in for them. */
const BODY_HEIGHT = 'h-[28rem]';

/** Enough placeholder rows to fill {@link BODY_HEIGHT}. */
const SKELETON_ROWS = 8;

/** The chrome shared by every header cell, so a sortable and a plain one match. */
const HEADER_CELL = 'border-b border-gray-200 px-4 py-3 text-xs font-medium whitespace-nowrap text-gray-500';

/** The chrome shared by every body cell. */
const BODY_CELL = 'px-4 py-3 whitespace-nowrap';

/** Which {@link Badge} fill each status wears. */
const STATUS_VARIANTS = {
    completed: 'neutral',
    pending: 'warning',
    failed: 'danger',
};

/**
 * The transactions themselves, one row each, above a pagination footer.
 *
 * Display only for now: the sort headers, the flag toggles and the page size
 * select are rendered in their final form but carry no handlers, so the markup
 * does not have to change when the listing hook lands:
 *
 *     <TransactionsTable transactions={page.data} loading={page.loading} sort={sort}
 *                        page={meta.current_page} pageCount={meta.last_page} perPage={meta.per_page} />
 *
 * The rows scroll at a fixed height instead of growing the card, which keeps the
 * dashboard the same size whatever the filters match — and keeps the footer in
 * one place rather than sliding up the page as rows drop out.
 *
 * A failed request takes over the scrolling area: the headers go with the rows,
 * because sorting a page that never arrived is not something to offer.
 *
 * @param {{ transactions?: typeof MOCK_TRANSACTIONS, loading?: boolean, error?: string|boolean, onRetry?: () => void, sort?: typeof DEFAULT_SORT, page?: number, pageCount?: number, perPage?: number, className?: string }} props
 */
export default function TransactionsTable({
    transactions = MOCK_TRANSACTIONS,
    loading = false,
    error = null,
    onRetry,
    sort = DEFAULT_SORT,
    page = 1,
    pageCount = 12,
    perPage = 20,
    className,
}) {
    return (
        <Card
            className={cn('flex min-w-0 flex-col overflow-hidden p-0', className)}
            aria-busy={(loading && !error) || undefined}
        >
            <div className={cn('overflow-auto', BODY_HEIGHT)}>
                {error ? (
                    <ErrorState
                        title="Couldn't load transactions"
                        message={error}
                        onRetry={onRetry}
                    />
                ) : (
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50">
                            <tr>
                                <SortableHeader label="Date" column="occurred_at" sort={sort} />
                                <th scope="col" className={cn(HEADER_CELL, 'w-full')}>
                                    Merchant
                                </th>
                                <th scope="col" className={HEADER_CELL}>
                                    Category
                                </th>
                                <SortableHeader label="Amount" column="amount" sort={sort} align="right" />
                                <th scope="col" className={HEADER_CELL}>
                                    Status
                                </th>
                                <th scope="col" className={cn(HEADER_CELL, 'text-right')}>
                                    Flag
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <TableSkeleton />
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-sm text-gray-500">
                                        No transactions match these filters.
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((transaction) => (
                                    <TransactionRow key={transaction.id} {...transaction} />
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            <TableFooter page={page} pageCount={pageCount} perPage={perPage} error={error} />
        </Card>
    );
}

/**
 * A column heading that doubles as the sort control. The arrow shows the
 * direction while the column is the one being sorted on, and the paired arrows
 * mark it as sortable while it is not.
 *
 * @param {{ label: string, column: string, sort: typeof DEFAULT_SORT, align?: 'left' | 'right' }} props
 */
function SortableHeader({ label, column, sort, align = 'left' }) {
    const isSorted = sort.column === column;
    const isAscending = sort.direction === 'asc';

    return (
        <th
            scope="col"
            aria-sort={isSorted ? (isAscending ? 'ascending' : 'descending') : 'none'}
            className={cn(HEADER_CELL, align === 'right' && 'text-right')}
        >
            {/* TODO: flip the direction on the sorted column, or switch to this one, via `onSortChange`. */}
            <button
                type="button"
                className={cn(
                    'inline-flex items-center gap-1 rounded hover:text-gray-900',
                    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
                )}
            >
                {label}
                {isSorted ? (
                    isAscending ? (
                        <ArrowUpIcon className="size-3.5" />
                    ) : (
                        <ArrowDownIcon className="size-3.5" />
                    )
                ) : (
                    <SortIcon className="size-3.5 text-gray-400" />
                )}
            </button>
        </th>
    );
}

/**
 * A single transaction. The merchant carries the weight because it is what the
 * eye scans for; everything else is set back so the column reads as one line.
 *
 * @param {typeof MOCK_TRANSACTIONS[number]} props
 */
function TransactionRow({ occurred_at: occurredAt, merchant, category, amount, status, flagged }) {
    return (
        <tr className="hover:bg-gray-50">
            <td className={cn(BODY_CELL, 'text-gray-500')}>{formatDate(occurredAt)}</td>
            <td className={cn(BODY_CELL, 'font-semibold text-gray-900')}>{merchant}</td>
            <td className={BODY_CELL}>
                <Badge variant="outline">{formatCategory(category)}</Badge>
            </td>
            <td className={cn(BODY_CELL, 'text-right font-medium tabular-nums text-gray-900')}>
                {formatCurrency(amount)}
            </td>
            <td className={BODY_CELL}>
                <Badge variant={STATUS_VARIANTS[status]}>{status}</Badge>
            </td>
            <td className={cn(BODY_CELL, 'text-right')}>
                {/* TODO: PATCH the flag through `onToggleFlag` when the flag action lands. */}
                <button
                    type="button"
                    aria-pressed={flagged}
                    aria-label={flagged ? `Unflag ${merchant}` : `Flag ${merchant}`}
                    className={cn(
                        'rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900',
                        flagged ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500',
                    )}
                >
                    <FlagIcon filled={flagged} />
                </button>
            </td>
        </tr>
    );
}

/**
 * Placeholder bars filling the same fixed height the rows occupy, so the card
 * does not resize or shift when the real transactions arrive.
 */
function TableSkeleton() {
    return Array.from({ length: SKELETON_ROWS }, (_, index) => (
        <tr key={index} aria-hidden="true">
            <td className={BODY_CELL}>
                <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
            </td>
            <td className={BODY_CELL}>
                <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
            </td>
            <td className={BODY_CELL}>
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </td>
            <td className={BODY_CELL}>
                <div className="ml-auto h-5 w-16 animate-pulse rounded bg-gray-200" />
            </td>
            <td className={BODY_CELL}>
                <div className="h-5 w-20 animate-pulse rounded bg-gray-200" />
            </td>
            <td className={BODY_CELL}>
                <div className="ml-auto h-5 w-4 animate-pulse rounded bg-gray-200" />
            </td>
        </tr>
    ));
}

/**
 * Page size and position on the left, the step controls on the right. The
 * buttons disable at the ends of the range rather than disappearing, so the
 * footer keeps its shape on the first and last page — and on a failed request,
 * where every control is disabled because there is no page to move around in.
 *
 * @param {{ page: number, pageCount: number, perPage: number, error?: string|boolean }} props
 */
function TableFooter({ page, pageCount, perPage, error }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 px-4 py-3">
            <div className="flex items-center gap-3">
                <label htmlFor="rows-per-page" className="text-sm text-gray-500">
                    Rows per page
                </label>
                {/* TODO: reset to page 1 and refetch through `onPerPageChange`; `defaultValue` until then. */}
                <Select
                    id="rows-per-page"
                    options={PER_PAGE_OPTIONS}
                    defaultValue={String(perPage)}
                    disabled={Boolean(error)}
                    className="w-auto py-1 pr-8 pl-2.5"
                />
                <p className="text-sm text-gray-500">
                    Page {formatCount(page)} of {formatCount(pageCount)}
                </p>
            </div>

            {/* TODO: step the page through `onPageChange` when pagination lands. */}
            <div className="flex gap-2">
                <Button variant="secondary" className="px-3 py-1.5" disabled={Boolean(error) || page <= 1}>
                    Previous
                </Button>
                <Button
                    variant="secondary"
                    className="px-3 py-1.5"
                    disabled={Boolean(error) || page >= pageCount}
                >
                    Next
                </Button>
            </div>
        </div>
    );
}
