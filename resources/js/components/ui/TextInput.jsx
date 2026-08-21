import { cn } from '../../lib/cn';
import { CONTROL_BASE, CONTROL_INVALID } from './styles';

/**
 * Controlled text input. Everything not named here is spread onto the `<input>`,
 * so `value`, `onChange`, `placeholder`, `maxLength`, `min`/`max` and friends
 * pass straight through. `leadingIcon` renders inside the field, on the left.
 */
export default function TextInput({ id, type = 'text', leadingIcon, invalid, className, ...props }) {
    const input = (
        <input
            id={id}
            type={type}
            aria-invalid={invalid || undefined}
            aria-describedby={invalid ? `${id}-error` : undefined}
            className={cn(
                CONTROL_BASE,
                invalid && CONTROL_INVALID,
                leadingIcon && 'pl-9',
                className,
            )}
            {...props}
        />
    );

    if (!leadingIcon) {
        return input;
    }

    return (
        <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {leadingIcon}
            </span>
            {input}
        </div>
    );
}
