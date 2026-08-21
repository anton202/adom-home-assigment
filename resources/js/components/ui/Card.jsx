import { cn } from '../../lib/cn';

/**
 * The panel shell every dashboard surface sits in — summary tiles, the filters
 * form, the table, the category breakdown. It owns nothing but the chrome, so a
 * card's heading, footer and body markup stay at the call site where they read
 * naturally.
 *
 * Padding is part of the shell because most cards want it. `cn()` merges
 * `className` last, so a full-bleed card (the table, whose rows and pagination
 * footer carry their own padding) opts out with `p-0`:
 *
 *     <Card className="p-0">
 *         <table>…</table>
 *     </Card>
 */
export default function Card({ className, children, ...props }) {
    return (
        <div
            className={cn('rounded-xl border border-gray-200 bg-white p-4 shadow-sm', className)}
            {...props}
        >
            {children}
        </div>
    );
}
