import { cn } from '../../lib/cn';

/**
 * Labelled wrapper around a single form control. The caller passes the same `id`
 * to both, which keeps the label association and the `aria-describedby` target
 * (`${id}-error`) visible at the call site:
 *
 *     <Field id="filter-category" label="Category" error={errors.category}>
 *         <Select id="filter-category" … />
 *     </Field>
 */
export default function Field({ id, label, hint, error, className, children }) {
    return (
        <div className={cn('flex flex-col', className)}>
            <label htmlFor={id} className="mb-1.5 text-sm font-medium text-gray-900">
                {label}
            </label>
            {children}
            {error ? (
                <p id={`${id}-error`} className="mt-1 text-sm text-red-600">
                    {error}
                </p>
            ) : (
                hint && <p className="mt-1 text-sm text-gray-500">{hint}</p>
            )}
        </div>
    );
}
