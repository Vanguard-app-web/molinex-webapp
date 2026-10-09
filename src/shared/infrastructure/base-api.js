import axios from 'axios';
import {ApiErrorHandler} from './api-error-handler.js';

const platformApi = import.meta.env.VITE_API_BASE_URL;

/**
 * Configures the Axios instance shared by every bounded-context API.
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
        this.#http.interceptors.response.use(
            response => response,
            error => {
                error.messages = ApiErrorHandler.toMessages(error);
                return Promise.reject(error);
            },
        );
    }
}
