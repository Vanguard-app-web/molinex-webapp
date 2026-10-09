/**
 * Kind of maintenance activity.
 * @readonly
 * @enum {string}
 */
export const MaintenanceType = Object.freeze({
    PREVENTIVE: 'PREVENTIVE',
    CORRECTIVE: 'CORRECTIVE',
});

export const maintenanceTypes = Object.freeze(Object.values(MaintenanceType));

/** @param {unknown} value */
export function isMaintenanceType(value) {
    return maintenanceTypes.includes(value);
}
