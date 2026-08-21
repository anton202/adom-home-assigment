import { cn } from '../../lib/cn';

/**
 * Fill only — the pill shape, size and typography are shared, so a category tag
 * and a status badge sit on the same baseline and differ by colour alone.
 */
const VARIANTS = {
    outline: 'border border-gray-300 bg-white text-gray-700',
    neutral: 'bg-gray-100 text-gray-700',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-500 text-white',
};

/**
 * A small pill for a single word of metadata — a transaction's category or its
 * status. Display only: a badge is never a control, so filtering by a value
 * stays with the filters panel.
 *
 *     <Badge variant="outline">Groceries</Badge>
 *     <Badge variant="danger">failed</Badge>
 *
 * @param {{ variant?: keyof typeof VARIANTS, className?: string, children?: React.ReactNode }} props
 */
export default function Badge({ variant = 'neutral', className, children, ...props }) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap',
                VARIANTS[variant],
                className,
            )}
            {...props}
        >
            {children}
        </span>
    );
}
