/**
 * Value Object for the moment a machine entered its current status.
 */
export class StatusChangeDateTime {
    #value;

    /** @param {Date|string} value */
    constructor(value) {
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (value === null || value === undefined || Number.isNaN(date.getTime())) {
            throw new Error('StatusChangeDateTime requires a valid date and time.');
        }
        this.#value = date;
    }

    /** @returns {Date} a copy, so callers cannot change the stored instant. */
    get value() {
        return new Date(this.#value.getTime());
    }
}
