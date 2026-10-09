/**
 * Value Object for the manufacturer model of a machine, e.g. "Satake HR-10".
 */
export class MachineModel {
    static MAX_LENGTH = 100;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > MachineModel.MAX_LENGTH) {
            throw new Error(`MachineModel must contain between 1 and ${MachineModel.MAX_LENGTH} characters.`);
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
