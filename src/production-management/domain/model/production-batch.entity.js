import {ProductionBatchId} from "./production-batch-id.js";
import {BatchCode} from "./batch-code.js";
import {RawMaterialReceptionId} from "./raw-material-reception-id.js";
import {BatchRegistrationDateTime} from "./batch-registration-date-time.js";

/**
 * Aggregate Root for a lot of raw material followed through the production process (US-06).
 * It references its reception by identity only.
 */
export class ProductionBatch {
    #id;
    #code;
    #receptionId;
    #registeredAt;

    /**
     * @param {{id?: ProductionBatchId|null, code: BatchCode, receptionId: RawMaterialReceptionId,
     *          registeredAt: BatchRegistrationDateTime}} props
     */
    constructor({id = null, code, receptionId, registeredAt}) {
        if (id !== null && !(id instanceof ProductionBatchId)) throw new Error('Invalid production batch id.');
        if (!(code instanceof BatchCode)) throw new Error('A production batch requires its code.');
        if (!(receptionId instanceof RawMaterialReceptionId)) throw new Error('A production batch requires its reception.');
        if (!(registeredAt instanceof BatchRegistrationDateTime)) throw new Error('A production batch requires its registration date.');
        this.#id = id;
        this.#code = code;
        this.#receptionId = receptionId;
        this.#registeredAt = registeredAt;
    }

    /**
     * Registers a new batch for an existing reception. Code uniqueness spans every batch,
     * so the application store checks it before calling the API.
     * @param {{code: BatchCode, receptionId: RawMaterialReceptionId, registeredAt: BatchRegistrationDateTime}} props
     * @returns {ProductionBatch}
     */
    static register({code, receptionId, registeredAt}) {
        return new ProductionBatch({id: null, code, receptionId, registeredAt});
    }

    get id() {
        return this.#id;
    }

    get code() {
        return this.#code;
    }

    get receptionId() {
        return this.#receptionId;
    }

    get registeredAt() {
        return this.#registeredAt;
    }
}
