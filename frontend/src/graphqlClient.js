/**
 * GraphQL URL: explicit VITE_GRAPHQL_URL, or VITE_BACKEND_URL + /graphql, or Vite proxy /graphql.
 * Direct calls use Laravel CORS (see backend/config/cors.php `graphql` path) so localhost:5173 works.
 */
function graphqlEndpoint() {
    const explicit = import.meta.env.VITE_GRAPHQL_URL;
    if (typeof explicit === 'string' && explicit.trim().length > 0) {
        return explicit.trim();
    }
    const backend = import.meta.env.VITE_BACKEND_URL;
    if (typeof backend === 'string' && backend.trim().length > 0) {
        return `${backend.replace(/\/$/, '')}/graphql`;
    }
    return '/graphql';
}

/**
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 */
export async function graphqlRequest(query, variables = {}) {
    const url = graphqlEndpoint();
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({ query, variables }),
    });

    const raw = await response.text();
    let payload;
    try {
        payload = raw ? JSON.parse(raw) : {};
    } catch {
        throw new Error(
            `Not JSON from ${url} (HTTP ${response.status}): ${raw.slice(0, 200)}`,
        );
    }

    if (!response.ok || payload.errors?.length) {
        const debug = payload.errors
            ?.map((e) => e.extensions?.debugMessage || e.message)
            .filter(Boolean)
            .join(' — ');
        const msg = debug || payload.message || `HTTP ${response.status}`;
        throw new Error(msg);
    }

    if (payload.data === undefined) {
        throw new Error(`Missing data in GraphQL response from ${url}`);
    }

    return payload.data;
}
