/**
 * The chrome shared by every form control, kept in one place so a text input and
 * a select can never drift apart visually.
 */
export const CONTROL_BASE =
    'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 ' +
    'placeholder:text-gray-400 focus:border-gray-900 focus:outline-none focus:ring-1 ' +
    'focus:ring-gray-900 disabled:bg-gray-50 disabled:text-gray-400';

/** Layered on top of {@link CONTROL_BASE} when a control fails validation. */
export const CONTROL_INVALID = 'border-red-500 focus:border-red-500 focus:ring-red-500';
