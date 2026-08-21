/**
 * Builds the query string for a request from a plain params object.
 *
 * The filters form holds every unset field as an empty string, which would
 * otherwise go on the wire as `?category=&status=`. Dropping empties here keeps
 * the URL to what the user actually chose — which matters beyond tidiness,
 * because the URL is what the fetching hooks key their effect on: two filter
 * sets that mean the same thing have to produce the same string.
 *
 * @param {Record<string, string|number|null|undefined>} params
 * @returns {string} `''` when nothing is set, otherwise `'?…'`
 */
export function buildQuery(params) {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== '' && value !== null && value !== undefined) {
            search.set(key, String(value));
        }
    }

    const query = search.toString();

    return query ? `?${query}` : '';
}
