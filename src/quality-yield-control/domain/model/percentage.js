/**
 * Value Object for a percentage between 0 and 100, both included.
 */
export class Percentage {
    static MINIMUM = 0;
    static MAXIMUM = 100;
    #value;

    /** @param {number} value */
    constructor(value) {
        if (!Percentage.isValid(value)) {
            throw new Error(`Percentage must be a number between ${Percentage.MINIMUM} and ${Percentage.MAXIMUM}.`);
        }
        this.#value = value;
    }

    /** @param {unknown} value */
    static isValid(value) {
        return typeof value === 'number' && Number.isFinite(value)
            && value >= Percentage.MINIMUM && value <= Percentage.MAXIMUM;
    }

    get value() {
        return this.#value;
    }
}
