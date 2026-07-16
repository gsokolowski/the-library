import { useCallback, useEffect, useRef, useState } from 'react';
import { graphqlRequest } from '../graphqlClient.js';
import { CIRCULATION_EVENTS_QUERY } from '../queries.js';

const POLL_MS = 4000;
const DEFAULT_LIMIT = 30;

/**
 * Polls desk activity (borrow / return) while `enabled` is true.
 *
 * @param {boolean} enabled
 */
export function useCirculationEvents(enabled) {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const mountedRef = useRef(true);

    const loadEvents = useCallback(async (opts = {}) => {
        const { silent = false } = opts;
        if (!silent) {
            setLoading(true);
        }
        try {
            const data = await graphqlRequest(CIRCULATION_EVENTS_QUERY, { limit: DEFAULT_LIMIT });
            if (mountedRef.current) {
                setEvents(data.circulationEvents ?? []);
                setError(null);
            }
        } catch (err) {
            if (mountedRef.current) {
                setError(err instanceof Error ? err.message : 'Could not load activity');
            }
        } finally {
            if (mountedRef.current && !silent) {
                setLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (!enabled) {
            return undefined;
        }

        void loadEvents();
        const id = window.setInterval(() => {
            void loadEvents({ silent: true });
        }, POLL_MS);

        return () => {
            window.clearInterval(id);
        };
    }, [enabled, loadEvents]);

    return {
        events,
        loading,
        error,
        refresh: () => loadEvents(),
    };
}
