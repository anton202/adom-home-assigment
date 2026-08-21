import { useState } from 'react';
import { useCategories } from '../hooks/useCategories';
import Button from './ui/Button';
import Card from './ui/Card';
import Field from './ui/Field';
import SearchInput from './ui/SearchInput';
import Select from './ui/Select';
import TextInput from './ui/TextInput';
import { SlidersIcon } from './ui/icons';

/**
 * The draft the form edits. The keys are the query parameters
 * `TransactionFilterRequest` accepts, so the object can go to the API as-is.
 */
const EMPTY_FILTERS = {
    date_from: '',
    date_to: '',
    category: '',
    status: '',
    search: '',
};

/** Mirrors `Transaction::STATUSES` — a fixed set, unlike the categories. */
const STATUS_OPTIONS = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
];

/**
 * The filters form. It owns the draft the user is editing and only hands it up
 * on submit, so typing in a field never re-runs a query — the table and the
 * summary refresh when "Apply filters" is pressed.
 *
 * @param {{ onApply?: (filters: typeof EMPTY_FILTERS) => void, onReset?: () => void, className?: string }} props
 */
export default function FiltersPanel({ onApply, onReset, className }) {
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const categories = useCategories();

    const setField = (name, value) => setFilters((current) => ({ ...current, [name]: value }));

    const handleSubmit = (event) => {
        event.preventDefault();
        onApply?.(filters);
    };

    const handleReset = () => {
        setFilters(EMPTY_FILTERS);
        onReset?.();
    };

    return (
        <Card className={className}>
            <h2 className="text-base font-semibold text-gray-900">Filters</h2>
            <p className="mt-0.5 text-sm text-gray-500">Applied to table and summary</p>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                    <Field id="filter-date-from" label="From">
                        <TextInput
                            id="filter-date-from"
                            type="date"
                            value={filters.date_from}
                            max={filters.date_to || undefined}
                            onChange={(event) => setField('date_from', event.target.value)}
                        />
                    </Field>
                    <Field id="filter-date-to" label="To">
                        <TextInput
                            id="filter-date-to"
                            type="date"
                            value={filters.date_to}
                            min={filters.date_from || undefined}
                            onChange={(event) => setField('date_to', event.target.value)}
                        />
                    </Field>
                </div>

                <Field
                    id="filter-category"
                    label="Category"
                    error={categories.error && 'Could not load categories'}
                >
                    <Select
                        id="filter-category"
                        value={filters.category}
                        options={categories.options}
                        placeholder="All categories"
                        disabled={categories.loading}
                        invalid={Boolean(categories.error)}
                        onChange={(event) => setField('category', event.target.value)}
                    />
                </Field>

                <Field id="filter-status" label="Status">
                    <Select
                        id="filter-status"
                        value={filters.status}
                        options={STATUS_OPTIONS}
                        placeholder="All statuses"
                        onChange={(event) => setField('status', event.target.value)}
                    />
                </Field>

                <Field id="filter-search" label="Merchant">
                    <SearchInput
                        id="filter-search"
                        value={filters.search}
                        placeholder="Search merchant…"
                        maxLength={255}
                        onChange={(event) => setField('search', event.target.value)}
                    />
                </Field>

                <div className="flex gap-2">
                    <Button type="submit" icon={<SlidersIcon />} className="flex-1">
                        Apply filters
                    </Button>
                    <Button variant="secondary" onClick={handleReset}>
                        Reset
                    </Button>
                </div>
            </form>
        </Card>
    );
}
