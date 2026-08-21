import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

/**
 * A GET request as component state: the response body, whether it is in flight,
 * why it failed, and a way to run it again.
 *
 * The effect is keyed on the URL rather than on a filters object, so it is the
 * *meaning* of the request that decides whether it re-runs. Re-applying the
 * same filters yields an equal string and fetches nothing; changing one field
 * yields a new one and fetches. Callers can therefore build the URL inline on
 * every render without memoising it.
 *
 * The request is aborted when the URL changes or the component unmounts, so a
 * slow response for filters the user has moved on from can never overwrite a
 * newer one.
 *
 * @param {string} url
 * @returns {{ data: unknown, loading: boolean, error: string|null, reload: () => void }}
 */
export function useApiResource(url) {
    const [state, setState] = useState(PENDING);

    /** Bumped by {@link reload}; a dependency purely so retrying re-runs the effect. */
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        const controller = new AbortController();

        setState(PENDING);

        api(url, { signal: controller.signal })
            .then((body) => setState({ data: body, loading: false, error: null }))
            .catch((error) => {
                if (error.name === 'AbortError') {
                    return;
                }

                // TODO: a 422 carries per-field messages in `error.body.errors`;
                // surface those on the offending filter rather than as a panel error.
                setState({ data: null, loading: false, error: messageFor(error) });
            });

        return () => controller.abort();
    }, [url, attempt]);

    const reload = useCallback(() => setAttempt((current) => current + 1), []);

    return { ...state, reload };
}

/**
 * The state a request starts in, and returns to whenever a new one begins — the
 * panels show their skeletons rather than figures belonging to the previous
 * filters.
 */
const PENDING = { data: null, loading: true, error: null };

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
function messageFor(error) {
    return error.status ? error.message : 'Could not reach the server.';
}
