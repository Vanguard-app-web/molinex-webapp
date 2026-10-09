/**
 * Value Object that identifies a maintenance record. The API assigns it; the frontend never generates it.
 */
export class MaintenanceRecordId {
    #value;

    /** @param {string|number} value */
    constructor(value) {
        const normalizedValue = String(value ?? '').trim();
        if (!normalizedValue) throw new Error('MaintenanceRecordId requires a value.');
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    /** @param {MaintenanceRecordId} other */
    equals(other) {
        return other instanceof MaintenanceRecordId && other.value === this.#value;
    }

    toString() {
        return this.#value;
    }
}
