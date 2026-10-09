/**
 * Value Object for the descriptive name of a machine, e.g. "Rice husker".
 */
export class MachineName {
    static MAX_LENGTH = 100;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > MachineName.MAX_LENGTH) {
            throw new Error(`MachineName must contain between 1 and ${MachineName.MAX_LENGTH} characters.`);
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
