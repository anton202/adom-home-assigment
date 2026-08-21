import { cn } from '../../lib/cn';
import Button from './Button';
import { AlertTriangleIcon } from './icons';

/** Shown when the caller has no message worth putting in front of the user. */
const FALLBACK_MESSAGE = 'Something went wrong. Please try again.';

/**
 * The panel-level failure state — what a card shows in place of its contents
 * when the request behind it did not come back.
 *
 * It owns no height of its own, only `h-full`, so it centres inside whatever
 * fixed-height box the panel already reserves for its rows and its skeleton.
 * That is what keeps a card the same size across loading, error, empty and
 * loaded, instead of the dashboard resizing under the user on a failed filter:
 *
 *     <div className={cn('overflow-auto', BODY_HEIGHT)}>
 *         <ErrorState title="Couldn't load transactions" message={error} onRetry={onRetry} />
 *     </div>
 *
 * `message` takes the error string straight from the `api()` helper, but falls
 * back to {@link FALLBACK_MESSAGE} whenever it is not a string — passing
 * `error={true}` is enough — so a raw response body never reaches the screen.
 *
 * @param {{ title: string, message?: string|boolean, onRetry?: () => void, className?: string }} props
 */
export default function ErrorState({ title, message, onRetry, className }) {
    return (
        <div
            role="alert"
            className={cn(
                'flex h-full flex-col items-center justify-center gap-1 px-6 py-8 text-center',
                className,
            )}
        >
            <AlertTriangleIcon className="size-6 text-red-500" />
            <p className="mt-1 text-sm font-medium text-gray-900">{title}</p>
            <p className="text-sm text-gray-500">
                {typeof message === 'string' && message ? message : FALLBACK_MESSAGE}
            </p>
            <Button variant="secondary" className="mt-3 px-3 py-1.5" onClick={() => onRetry?.()}>
                Retry
            </Button>
        </div>
    );
}
