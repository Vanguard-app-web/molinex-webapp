/**
 * Operational status of a machine.
 * @readonly
 * @enum {string}
 */
export const MachineStatus = Object.freeze({
    OPERATIONAL: 'OPERATIONAL',
    REQUIRES_ATTENTION: 'REQUIRES_ATTENTION',
    UNDER_MAINTENANCE: 'UNDER_MAINTENANCE',
    OUT_OF_SERVICE: 'OUT_OF_SERVICE',
});

export const machineStatuses = Object.freeze(Object.values(MachineStatus));

/** @param {unknown} value */
export function isMachineStatus(value) {
    return machineStatuses.includes(value);
}
