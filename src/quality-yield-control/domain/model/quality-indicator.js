/**
 * Quality indicators measured on processed rice.
 * @readonly
 * @enum {string}
 */
export const QualityIndicator = Object.freeze({
    WHOLE_GRAIN_PERCENTAGE: 'WHOLE_GRAIN_PERCENTAGE',
    BROKEN_GRAIN_PERCENTAGE: 'BROKEN_GRAIN_PERCENTAGE',
    YIELD_PERCENTAGE: 'YIELD_PERCENTAGE',
});

export const qualityIndicators = Object.freeze(Object.values(QualityIndicator));

/** @param {unknown} value */
export function isQualityIndicator(value) {
    return qualityIndicators.includes(value);
}
