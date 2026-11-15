/**
 * i18n keys for the error codes the API returns in its common error format
 * (`{status, code, message, details}`). They take precedence over the generic HTTP status.
 */
const messageKeyByErrorCode = Object.freeze({
    INVALID_CREDENTIALS: 'api-errors.invalid-credentials',
    ACCOUNT_INACTIVE: 'api-errors.account-inactive',
    ACCOUNT_LOCKED: 'api-errors.account-locked',
    EMAIL_ALREADY_REGISTERED: 'api-errors.email-registered',
    LAST_ADMINISTRATOR: 'api-errors.last-administrator',
    USER_NOT_FOUND: 'api-errors.user-not-found',
    AUTHENTICATION_REQUIRED: 'api-errors.session-expired',
    INVALID_TOKEN: 'api-errors.session-expired',
    PRIVILEGE_CHANGE_FORBIDDEN: 'api-errors.privilege-change',
});

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
        const codedMessage = messageKeyByErrorCode[error.response.data?.code];

        if (codedMessage) return [codedMessage];
        if (status === 400 || status === 422) return ['api-errors.bad-request'];
        if (status === 401) return ['api-errors.session-expired'];
        if (status === 403) return ['api-errors.forbidden'];
        if (status === 404) return ['api-errors.not-found'];
        if (status === 409) return ['api-errors.conflict'];
        if (status >= 500) return ['api-errors.server'];

        return ['api-errors.unexpected'];
    }
}
