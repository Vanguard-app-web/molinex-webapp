/**
 * Value Object for the supplier that delivered a raw material reception.
 */
export class Supplier {
    static MAX_LENGTH = 100;
    #name;

    /** @param {string} name */
    constructor(name) {
        const normalizedName = typeof name === 'string' ? name.trim() : '';
        if (!normalizedName || normalizedName.length > Supplier.MAX_LENGTH) {
            throw new Error(`Supplier name must contain between 1 and ${Supplier.MAX_LENGTH} characters.`);
        }
        this.#name = normalizedName;
    }

    get name() {
        return this.#name;
    }

    toString() {
        return this.#name;
    }
}
