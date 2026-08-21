/**
 * Minimal JSON fetch helper. Throws on non-2xx responses; the thrown error
 * carries `status` and the parsed response `body` so callers can inspect
 * validation errors (e.g. err.body.errors on a 422).
 */
export async function api(url, options = {}) {
    const response = await fetch(url, {
        ...options,
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    const body = response.status === 204 ? null : await response.json().catch(() => null);

    if (!response.ok) {
        const error = new Error(body?.message || `Request failed with status ${response.status}`);
        error.status = response.status;
        error.body = body;
        throw error;
    }

    return body;
}

/**
 * What to put in front of the user when a request fails.
 *
 * An error carrying a `status` came back from the application, so its message
 * was written for this API and is worth showing. One without never reached it —
 * the network was down, the server was not listening — and its message is the
 * browser's ("Failed to fetch"), which describes the machinery rather than the
 * situation.
 *
 * @param {Error & { status?: number }} error
 * @returns {string}
 */
export function errorMessage(error) {
    return error.status ? error.message : 'Could not reach the server.';
}
