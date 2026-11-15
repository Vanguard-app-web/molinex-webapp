/**
 * State of a user account. Only ACTIVE accounts can authenticate.
 * @readonly
 * @enum {string}
 */
export const AccountStatus = Object.freeze({
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE',
    LOCKED: 'LOCKED',
});

export const accountStatuses = Object.freeze(Object.values(AccountStatus));

/** @param {unknown} value */
export function isAccountStatus(value) {
    return accountStatuses.includes(value);
}
