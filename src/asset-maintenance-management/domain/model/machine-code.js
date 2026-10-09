/**
 * Value Object for the code that uniquely identifies a machine in the mill inventory, stored in upper case (e.g. "MOL-HSK-01").
 */
export class MachineCode {
    static MAX_LENGTH = 30;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim().toUpperCase() : '';
        if (!normalizedValue || normalizedValue.length > MachineCode.MAX_LENGTH) {
            throw new Error(`MachineCode must contain between 1 and ${MachineCode.MAX_LENGTH} characters.`);
        }
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {MachineCode} other */
    equals(other) {
        return other instanceof MachineCode && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}
