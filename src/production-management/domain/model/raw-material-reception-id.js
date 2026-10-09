/**
 * Value Object that identifies a raw material reception. The API assigns it; the frontend never generates it.
 */
export class RawMaterialReceptionId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('RawMaterialReceptionId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {RawMaterialReceptionId} other */
    equals(other) {
        return other instanceof RawMaterialReceptionId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}
