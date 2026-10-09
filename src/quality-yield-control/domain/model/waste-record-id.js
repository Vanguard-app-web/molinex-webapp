/**
 * Value Object that identifies a waste record. The API assigns it; the frontend never generates it.
 */
export class WasteRecordId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('WasteRecordId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {WasteRecordId} other */
    equals(other) {
        return other instanceof WasteRecordId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}
