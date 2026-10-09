/**
 * Lifecycle status of a production process.
 * @readonly
 * @enum {string}
 */
export const ProductionStatus = Object.freeze({
    REGISTERED: 'REGISTERED',
    IN_PROGRESS: 'IN_PROGRESS',
    COMPLETED: 'COMPLETED',
});

export const productionStatuses = Object.freeze(Object.values(ProductionStatus));

/** @param {unknown} value */
export function isProductionStatus(value) {
    return productionStatuses.includes(value);
}
