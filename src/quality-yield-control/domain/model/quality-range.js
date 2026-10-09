import {Percentage} from "./percentage.js";

/**
 * Value Object for the range a quality measurement is expected to fall in.
 */
export class QualityRange {
    #minimum;
    #maximum;

    /**
     * @param {Percentage} minimum
     * @param {Percentage} maximum
     */
    constructor(minimum, maximum) {
        if (!(minimum instanceof Percentage) || !(maximum instanceof Percentage)) {
            throw new Error('A quality range requires a minimum and a maximum percentage.');
        }
        if (minimum.value > maximum.value) throw new Error('The minimum of a quality range must not exceed its maximum.');
        this.#minimum = minimum;
        this.#maximum = maximum;
    }

    /** The whole 0-100 % scale, used while no reference values have been defined for an indicator. */
    static fullScale() {
        return new QualityRange(new Percentage(Percentage.MINIMUM), new Percentage(Percentage.MAXIMUM));
    }

    get minimum() {
        return this.#minimum;
    }

    get maximum() {
        return this.#maximum;
    }

    /** @param {Percentage} value */
    contains(value) {
        return value.value >= this.#minimum.value && value.value <= this.#maximum.value;
    }
}
