/**
 * Value Object for the name of a production process, e.g. "Cleaning and husking".
 */
export class ProductionProcessName {
    static MAX_LENGTH = 100;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > ProductionProcessName.MAX_LENGTH) {
            throw new Error(`Process name must contain between 1 and ${ProductionProcessName.MAX_LENGTH} characters.`);
        }
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    toString() {
        return this.#value;
    }
}
