/**
 * Value Object for the place a raw material reception comes from (its procedencia).
 */
export class MaterialOrigin {
    static MAX_LENGTH = 150;
    #description;

    /** @param {string} description */
    constructor(description) {
        const normalizedDescription = typeof description === 'string' ? description.trim() : '';
        if (!normalizedDescription || normalizedDescription.length > MaterialOrigin.MAX_LENGTH) {
            throw new Error(`Material origin must contain between 1 and ${MaterialOrigin.MAX_LENGTH} characters.`);
        }
        this.#description = normalizedDescription;
    }

    get description() {
        return this.#description;
    }

    toString() {
        return this.#description;
    }
}
