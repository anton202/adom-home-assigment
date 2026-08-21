import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Compose Tailwind class names. `clsx` flattens conditionals, `twMerge` resolves
 * conflicts in favour of the last class — so a `className` passed to one of the
 * `components/ui` primitives genuinely overrides its base styles instead of
 * sitting next to them.
 */
export function cn(...inputs) {
    return twMerge(clsx(inputs));
}
