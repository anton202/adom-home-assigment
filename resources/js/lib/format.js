/**
 * Presentation helpers for the figures the API returns as plain numbers. The
 * formatters are built once at module scope — the summary tiles and the table
 * re-render on every filter change, and `Intl.NumberFormat` is expensive to
 * construct.
 */

const CURRENCY = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const COUNT = new Intl.NumberFormat('en-US');

/**
 * A monetary amount, e.g. `11662.4` → `$11,662.40`.
 *
 * @param {number} amount
 * @returns {string}
 */
export function formatCurrency(amount) {
    return CURRENCY.format(amount);
}

/**
 * A whole number with thousands separators, e.g. `1204` → `1,204`.
 *
 * @param {number} count
 * @returns {string}
 */
export function formatCount(count) {
    return COUNT.format(count);
}

/**
 * A bare category slug as a label, e.g. `groceries` → `Groceries`.
 *
 * @param {string} category
 * @returns {string}
 */
export function formatCategory(category) {
    return category.charAt(0).toUpperCase() + category.slice(1);
}
