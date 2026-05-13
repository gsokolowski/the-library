/**
 * GraphQL HTTP endpoint. Default `/graphql` hits the Vite dev proxy to the Laravel API.
 * Override with VITE_GRAPHQL_URL when the SPA and API are on different origins.
 */
function graphqlEndpoint() {
    const explicit = import.meta.env.VITE_GRAPHQL_URL;
    if (typeof explicit === 'string' && explicit.length > 0) {
        return explicit;
    }
    return '/graphql';
}

/**
 * @param {string} query
 * @param {Record<string, unknown>} [variables]
 */
export async function graphqlRequest(query, variables = {}) {
    const response = await fetch(graphqlEndpoint(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        credentials: 'omit',
        body: JSON.stringify({ query, variables }),
    });

    const payload = await response.json();

    if (!response.ok || payload.errors?.length) {
        const msg =
            payload.errors?.map((e) => e.message).join(', ') ||
            `HTTP ${response.status}`;
        throw new Error(msg);
    }

    return payload.data;
}
