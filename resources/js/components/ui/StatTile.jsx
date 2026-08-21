import { cn } from '../../lib/cn';
import Card from './Card';

/**
 * A single headline figure — a muted label above a large value. The chrome comes
 * from {@link Card}, so a tile only owns its typography.
 *
 * The label and the value are marked up as a `<dl>` pair rather than two sibling
 * `<div>`s: on screen the relationship is carried by size and position, and the
 * description list is what carries it to assistive tech.
 *
 * While `loading` is set the value is replaced by a placeholder bar of the same
 * height, so nothing shifts when the real figure arrives:
 *
 *     <StatTile label="Total amount" value={formatCurrency(total)} loading={summary.loading} />
 */
export default function StatTile({ label, value, loading = false, className, ...props }) {
    return (
        <Card className={cn('min-w-0', className)} aria-busy={loading || undefined} {...props}>
            <dl>
                <dt className="text-sm text-gray-500">{label}</dt>
                {loading ? (
                    <dd className="mt-1 h-9 w-24 animate-pulse rounded bg-gray-200" aria-hidden="true" />
                ) : (
                    <dd className="mt-1 truncate text-3xl font-bold tracking-tight text-gray-900">
                        {value}
                    </dd>
                )}
            </dl>
        </Card>
    );
}
