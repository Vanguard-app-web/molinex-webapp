/**
 * Capabilities a role grants. VIEW_REPORTS exists in the design but this application has no
 * reporting views, so it only travels with the role.
 * @readonly
 * @enum {string}
 */
export const Permission = Object.freeze({
    MANAGE_USERS: 'MANAGE_USERS',
    MANAGE_PRODUCTION: 'MANAGE_PRODUCTION',
    MANAGE_MAINTENANCE: 'MANAGE_MAINTENANCE',
    VIEW_OPERATIONAL_INFORMATION: 'VIEW_OPERATIONAL_INFORMATION',
    VIEW_REPORTS: 'VIEW_REPORTS',
});

export const permissions = Object.freeze(Object.values(Permission));

/** @param {unknown} value */
export function isPermission(value) {
    return permissions.includes(value);
}
