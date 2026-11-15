import axios, {AxiosError} from "axios";

/**
 * Replaces the Axios transport with an in-memory handler, so the stores can be tested together
 * with their real API adapters, assemblers and interceptors, without a network.
 *
 * Call it before importing a store: each API adapter creates its Axios instance when its module
 * loads, and instances inherit these defaults.
 */
export function installFakeHttp() {
    const state = {handler: async () => ({status: 404, data: {code: "NOT_FOUND"}}), calls: []};

    axios.defaults.baseURL = "http://api.test/api/v1";
    axios.defaults.adapter = async config => {
        const request = {
            method: config.method.toUpperCase(),
            path: config.url,
            body: config.data ? JSON.parse(config.data) : undefined,
            authorization: config.headers.get("Authorization") ?? null,
        };
        state.calls.push(request);
        const result = await state.handler(request);
        if (result === "network") throw new AxiosError("Network Error", AxiosError.ERR_NETWORK, config, {});
        const response = {data: result.data ?? null, status: result.status ?? 200, statusText: "", headers: {}, config, request: {}};
        if (response.status >= 400) {
            throw new AxiosError(`Request failed with status ${response.status}`, AxiosError.ERR_BAD_REQUEST, config, {}, response);
        }
        return response;
    };

    return {
        calls: state.calls,
        /** Chooses what the API answers from now on. */
        use(handler) {
            state.handler = handler;
        },
        reset() {
            state.calls.length = 0;
        },
    };
}

/** Browser storage stand-in for the token storage. */
export function installStorage() {
    const entries = new Map();
    Object.defineProperty(globalThis, "localStorage", {
        configurable: true,
        writable: true,
        value: {
            getItem: key => (entries.has(key) ? entries.get(key) : null),
            setItem: (key, value) => entries.set(key, String(value)),
            removeItem: key => entries.delete(key),
        },
    });
    return entries;
}
