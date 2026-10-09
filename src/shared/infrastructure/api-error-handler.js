/**
 * Translates a failed request into i18n message keys so stores and views do not
 * need to interpret Axios errors or HTTP status codes.
 */
export class ApiErrorHandler {
    /**
     * @param {unknown} error an Axios error or a domain-mapping error.
     * @returns {string[]} i18n keys describing the failure.
     */
    static toMessages(error) {
        if (Array.isArray(error?.messages)) return error.messages;
        if (!error?.isAxiosError) return ['api-errors.invalid-data'];
        if (!error.response) return ['api-errors.network'];

        const status = error.response.status;

        if (status === 400 || status === 422) return ['api-errors.bad-request'];
        if (status === 404) return ['api-errors.not-found'];
        if (status === 409) return ['api-errors.conflict'];
        if (status >= 500) return ['api-errors.server'];

        return ['api-errors.unexpected'];
    }
}
