import { useCallback, useRef, useState } from 'react';
import { api, errorMessage } from '../lib/api';

/**
 * The flag toggles as component state: which rows this client has changed, which
 * of those writes are still in flight, and which of them failed.
 *
 * It is an *overlay* rather than a copy of the rows. {@link useApiResource} owns
 * its response body privately, so the fetched list cannot be edited in place, and
 * refetching it after a toggle would return the table to its skeleton — a whole
 * card blanking for a one-row change. So the rows keep rendering from the
 * response, and only the ids in this map are read from here instead.
 *
 * The toggle is applied before the request is sent and reverted if it fails,
 * because a flag is a switch: the value it should take is known at the click, and
 * waiting for a round trip to draw it makes the row feel broken.
 *
 * The map describes the rows currently on screen, so {@link reset} is called when
 * the filters, sort or page move to a different slice — the request that follows
 * carries the server's own values anyway.
 *
 * @returns {{ flags: Record<number, { flagged: boolean, pending: boolean, error: string|null }>, toggleFlag: (id: number, next: boolean, previous: boolean) => void, reset: () => void }}
 */
export function useTransactionFlag() {
    const [flags, setFlags] = useState({});

    /**
     * The token of the most recent write per row. A response settles its row only
     * while its own token is still the one recorded here, which drops both the
     * earlier of two responses for a row clicked twice and any response arriving
     * after {@link reset} cleared the map — the latter would otherwise put a row
     * that has scrolled away back into it.
     */
    const tokens = useRef({});

    /** Handed out in order, so a later write always outranks an earlier one. */
    const lastToken = useRef(0);

    const toggleFlag = useCallback((id, next, previous) => {
        const token = (lastToken.current += 1);
        tokens.current[id] = token;

        setFlags((current) => ({
            ...current,
            [id]: { flagged: next, pending: true, error: null },
        }));

        /** Applies a settled state only while this write is still the row's latest. */
        const settle = (state) =>
            setFlags((current) =>
                tokens.current[id] === token ? { ...current, [id]: state } : current,
            );

        api(`/api/transactions/${id}/flag`, {
            method: 'PATCH',
            body: JSON.stringify({ flagged: next }),
        })
            .then((body) =>
                // The server's value rather than the optimistic one: the request
                // has been answered, so there is no longer any need to guess.
                settle({ flagged: body.data.flagged, pending: false, error: null }),
            )
            .catch((error) =>
                // Back to what the row showed before the click. Leaving the
                // optimistic flag up would claim a change the server never made.
                settle({ flagged: previous, pending: false, error: errorMessage(error) }),
            );
    }, []);

    const reset = useCallback(() => {
        tokens.current = {};
        setFlags({});
    }, []);

    return { flags, toggleFlag, reset };
}
