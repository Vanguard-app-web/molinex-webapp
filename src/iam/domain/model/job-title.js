/**
 * Value Object for the job title of a user. It is optional: an empty value means "not provided".
 */
export class JobTitle {
    static MAX_LENGTH = 100;
    #value;

    /** @param {string} [value] */
    constructor(value = '') {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (normalizedValue.length > JobTitle.MAX_LENGTH) {
            throw new Error(`JobTitle must contain at most ${JobTitle.MAX_LENGTH} characters.`);
        }
        this.#value = normalizedValue;
    }

    get value() {
        return this.#value;
    }

    isEmpty() {
        return this.#value === '';
    }

    toString() {
        return this.#value;
    }
}
