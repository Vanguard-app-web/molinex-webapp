import {Percentage} from "./percentage.js";
import {QualityRange} from "./quality-range.js";
import {isQualityIndicator} from "./quality-indicator.js";

/**
 * Value Object for the value measured for one quality indicator, with the range it was expected in.
 */
export class QualityMeasurement {
    #indicator;
    #value;
    #expectedRange;

    /**
     * @param {string} indicator a {@link QualityIndicator}.
     * @param {Percentage} value
     * @param {QualityRange} expectedRange
     */
    constructor(indicator, value, expectedRange) {
        if (!isQualityIndicator(indicator)) throw new Error(`Unsupported quality indicator: ${indicator}.`);
        if (!(value instanceof Percentage)) throw new Error('A quality measurement requires a percentage value.');
        if (!(expectedRange instanceof QualityRange)) throw new Error('A quality measurement requires its expected range.');
        this.#indicator = indicator;
        this.#value = value;
        this.#expectedRange = expectedRange;
    }

    get indicator() {
        return this.#indicator;
    }

    get value() {
        return this.#value;
    }

    get expectedRange() {
        return this.#expectedRange;
    }

    isOutsideExpectedRange() {
        return !this.#expectedRange.contains(this.#value);
    }
}
