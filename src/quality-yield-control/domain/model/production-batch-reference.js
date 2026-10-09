/**
 * Read Model: the identity and code of a production batch owned by Production Management,
 * used to filter and label waste and quality results by batch.
 */
export class ProductionBatchReference {
    #id;
    #code;

    /** @param {{id: string, code: string}} props */
    constructor({id, code}) {
        this.#id = String(id);
        this.#code = String(code);
    }

    get id() {
        return this.#id;
    }

    get code() {
        return this.#code;
    }
}
