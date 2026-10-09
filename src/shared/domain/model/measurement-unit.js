/**
 * Units in which Molinex measures rice weight. Shared by Production Management
 * and Quality and Yield Control.
 *
 * @readonly
 * @enum {string}
 */
export const MeasurementUnit = Object.freeze({
    KILOGRAM: 'KILOGRAM',
    METRIC_TON: 'METRIC_TON',
});

const KILOGRAMS_PER_UNIT = Object.freeze({
    [MeasurementUnit.KILOGRAM]: 1,
    [MeasurementUnit.METRIC_TON]: 1000,
});

/** Every supported unit, in the order forms present them. */
export const measurementUnits = Object.freeze(Object.values(MeasurementUnit));

/**
 * @param {unknown} value
 * @returns {boolean} true when the value is one of the supported units.
 */
export function isMeasurementUnit(value) {
    return measurementUnits.includes(value);
}

/**
 * @param {string} unit a {@link MeasurementUnit}.
 * @returns {number} how many kilograms one unit represents.
 */
export function kilogramsPerUnit(unit) {
    if (!isMeasurementUnit(unit)) throw new Error(`Unsupported measurement unit: ${unit}.`);
    return KILOGRAMS_PER_UNIT[unit];
}
