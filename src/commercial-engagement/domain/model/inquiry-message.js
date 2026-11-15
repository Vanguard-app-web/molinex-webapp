/**
 * Value Object for the message of a commercial inquiry. It has no length limit.
 */
export class InquiryMessage {
    #value;

    /** @param {string} value */
    constructor(value) {
        if (InquiryMessage.isBlank(value)) throw new Error('InquiryMessage requires a value.');
        this.#value = value.trim();
    }

    /**
     * @param {unknown} value a raw string, e.g. what a form holds.
     * @returns {boolean} true when it holds nothing but whitespace.
     */
    static isBlank(value) {
        return typeof value !== 'string' || value.trim() === '';
    }

    get value() {
        return this.#value;
    }

    isBlank() {
        return InquiryMessage.isBlank(this.#value);
    }

    toString() {
        return this.#value;
    }
}
