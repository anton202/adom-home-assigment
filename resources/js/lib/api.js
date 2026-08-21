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
