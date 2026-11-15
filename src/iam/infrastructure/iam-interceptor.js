import {tokenStorage} from "./token-storage.js";

/** Error codes of the API that mean "the credentials sent with the request were wrong", not "the token was rejected". */
const CREDENTIAL_ERROR_CODES = new Set(['INVALID_CREDENTIALS']);

let unauthorizedListener = null;

/**
 * Origin the request is addressed to, or null when it cannot be resolved.
 * @param {string|undefined} url
 * @param {string|undefined} baseUrl
 */
function originOf(url, baseUrl) {
    try {
        const reference = globalThis.location?.href;
        const base = baseUrl ? new URL(baseUrl, reference) : reference;
        return new URL(url ?? '', base).origin;
    } catch {
        return null;
    }
}

/**
 * HTTP Interceptor of Identity and Access Management. {@link BaseApi} installs it once on every
 * Axios instance, so each API adapter sends the bearer token without knowing about it.
 */
export const iamInterceptor = {
    /**
     * Adds `Authorization: Bearer <token>` when a session exists and the request goes to the API
     * origin. Requests to any other origin never receive the token.
     * @param {import('axios').InternalAxiosRequestConfig} config
     */
    onRequest(config) {
        const token = tokenStorage.get();
        if (!token) return config;

        const apiOrigin = originOf('', config.baseURL);
        if (apiOrigin === null || originOf(config.url, config.baseURL) !== apiOrigin) return config;

        config.headers.set('Authorization', `Bearer ${token.value}`);
        return config;
    },

    /**
     * Tells the listener (the IAM store) that the API rejected the token that was sent.
     * @param {import('axios').AxiosError} error
     */
    onResponseError(error) {
        const response = error?.response;
        if (!response || response.status !== 401) return;
        if (!error.config?.headers?.get?.('Authorization')) return;
        if (CREDENTIAL_ERROR_CODES.has(response.data?.code)) return;
        unauthorizedListener?.();
    },

    /** @param {(() => void)|null} listener called when the API rejects the access token. */
    setUnauthorizedListener(listener) {
        unauthorizedListener = listener;
    },
};
