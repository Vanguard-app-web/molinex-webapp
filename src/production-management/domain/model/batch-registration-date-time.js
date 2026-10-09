/**
 * Value Object for the moment a production batch was registered.
 */
export class BatchRegistrationDateTime {
    #value;

    /** @param {Date|string} value */
    constructor(value) {
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (value === null || value === undefined || Number.isNaN(date.getTime())) {
            throw new Error('BatchRegistrationDateTime requires a valid date and time.');
        }
        this.#value = date;
    }

    /** @returns {Date} a copy, so callers cannot change the stored instant. */
    get value() {
        return new Date(this.#value.getTime());
    }
}
