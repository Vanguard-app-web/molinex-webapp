import {isMeasurementUnit, kilogramsPerUnit} from './measurement-unit.js';

/**
 * Value Object for a non-negative rice weight expressed in a {@link MeasurementUnit}.
 * Contexts that require a strictly positive weight can check {@link Weight#isPositive}.
 */
export class Weight {
    #value;
    #unit;

    /**
     * @param {number} value amount, zero or greater.
     * @param {string} unit a {@link MeasurementUnit}.
     */
    constructor(value, unit) {
        if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) {
            throw new Error('Weight must be a number equal to or greater than zero.');
        }
        if (!isMeasurementUnit(unit)) {
            throw new Error(`Unsupported measurement unit: ${unit}.`);
        }
        this.#value = value;
        this.#unit = unit;
    }

    /**
     * @param {number} value
     * @param {string} unit
     * @returns {Weight}
     */
    static create(value, unit) {
        return new Weight(value, unit);
    }

    get value() {
        return this.#value;
    }

    get unit() {
        return this.#unit;
    }

    isPositive() {
        return this.#value > 0;
    }

    isNonNegative() {
        return this.#value >= 0;
    }

    /** @returns {number} the same weight converted to kilograms. */
    toKilograms() {
        return this.#value * kilogramsPerUnit(this.#unit);
    }

    /**
     * @param {Weight} other
     * @returns {boolean} true when this weight is heavier than the other one.
     */
    exceeds(other) {
        return this.toKilograms() > other.toKilograms();
    }
}
