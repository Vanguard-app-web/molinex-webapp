/**
 * Value Object for the moment a raw material reception arrived at the mill.
 */
export class ReceptionDateTime {
    #value;

    /** @param {Date|string} value */
    constructor(value) {
        const date = value instanceof Date ? new Date(value.getTime()) : new Date(value);
        if (value === null || value === undefined || Number.isNaN(date.getTime())) {
            throw new Error('ReceptionDateTime requires a valid date and time.');
        }
        this.#value = date;
    }

    /** @returns {Date} a copy, so callers cannot change the stored instant. */
    get value() {
        return new Date(this.#value.getTime());
    }

    /** @param {Date} [now] */
    isNotInFuture(now = new Date()) {
        return this.#value.getTime() <= now.getTime();
    }
}
