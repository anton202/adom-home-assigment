import { cn } from '../../lib/cn';

const VARIANTS = {
    primary: 'bg-gray-900 text-white hover:bg-gray-800 focus-visible:outline-gray-900',
    secondary:
        'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-900',
};

/**
 * `type` deliberately defaults to `button`: inside a filters `<form>` only the
 * submit action should be a submit button, so "Reset" cannot fire it by accident.
 */
export default function Button({
    variant = 'primary',
    type = 'button',
    icon,
    className,
    children,
    ...props
}) {
    return (
        <button
            type={type}
            className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium',
                'focus-visible:outline-2 focus-visible:outline-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                VARIANTS[variant],
                className,
            )}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}
