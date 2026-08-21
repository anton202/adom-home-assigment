import { cn } from '../../lib/cn';
import { ChevronDownIcon } from './icons';
import { CONTROL_BASE, CONTROL_INVALID } from './styles';

/**
 * Native `<select>` with the browser arrow replaced by our own chevron.
 *
 * `options` is an array of `{ value, label }`. When `placeholder` is given it
 * becomes a leading empty option, so `''` is the "no filter" value and clearing
 * the control is always possible.
 */
export default function Select({ id, value, options, placeholder, invalid, className, ...props }) {
    return (
        <div className="relative">
            <select
                id={id}
                value={value}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? `${id}-error` : undefined}
                className={cn(
                    CONTROL_BASE,
                    'appearance-none pr-9',
                    value === '' && 'text-gray-400',
                    invalid && CONTROL_INVALID,
                    className,
                )}
                {...props}
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option.value} value={option.value} className="text-gray-900">
                        {option.label}
                    </option>
                ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-400" />
        </div>
    );
}
