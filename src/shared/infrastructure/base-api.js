import axios from 'axios';
import {ApiErrorHandler} from './api-error-handler.js';
import {iamInterceptor} from '../../iam/infrastructure/iam-interceptor.js';

const platformApi = import.meta.env?.VITE_API_BASE_URL;

/**
 * Configures the Axios instance shared by every bounded-context API. Each API creates its own
 * instance, and this is the only place that installs the authentication interceptor, so every
 * instance gets it exactly once.
 */
export class BaseApi {
    #http;

    constructor() {
        this.#http = axios.create({
            baseURL: platformApi,
            headers: {'Content-Type': 'application/json'},
        });
        this.#configureInterceptors();
    }

    get http() {
        return this.#http;
    }

    #configureInterceptors() {
        this.#http.interceptors.request.use(config => iamInterceptor.onRequest(config));
        this.#http.interceptors.response.use(
            response => response,
            error => {
                error.messages = ApiErrorHandler.toMessages(error);
                iamInterceptor.onResponseError(error);
                return Promise.reject(error);
            },
        );
    }
}
