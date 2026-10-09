/**
 * Value Object for the description or observations of a maintenance activity.
 */
export class MaintenanceDescription {
    static MAX_LENGTH = 500;
    #value;

    /** @param {string} value */
    constructor(value) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > MaintenanceDescription.MAX_LENGTH) {
            throw new Error(`MaintenanceDescription must contain between 1 and ${MaintenanceDescription.MAX_LENGTH} characters.`);
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
