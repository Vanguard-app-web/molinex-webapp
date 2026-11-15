/**
 * Roles a Molinex user can hold, as named by the Identity and Access Management design.
 * @readonly
 * @enum {string}
 */
export const RoleType = Object.freeze({
    ADMINISTRATOR: 'ADMINISTRATOR',
    MAINTENANCE_TECHNICIAN: 'MAINTENANCE_TECHNICIAN',
    PRODUCTION_OPERATOR: 'PRODUCTION_OPERATOR',
});

export const roleTypes = Object.freeze(Object.values(RoleType));

/** @param {unknown} value */
export function isRoleType(value) {
    return roleTypes.includes(value);
}
