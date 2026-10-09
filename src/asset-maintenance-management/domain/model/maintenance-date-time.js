/**
 * Value Object for the date and time of a maintenance activity.
 */
export class MaintenanceDateTime {
    #value;

    /** @param {Date|string} value */
    constructor(value) {
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (value === null || value === undefined || Number.isNaN(date.getTime())) {
            throw new Error('MaintenanceDateTime requires a valid date and time.');
        }
        this.#value = date;
    }

    /** @returns {Date} a copy, so callers cannot change the stored instant. */
    get value() {
        return new Date(this.#value.getTime());
    }
}
