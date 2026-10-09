/**
 * Value Object that identifies a machine. The API assigns it; the frontend never generates it.
 */
export class MachineId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('MachineId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {MachineId} other */
    equals(other) {
        return other instanceof MachineId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}
