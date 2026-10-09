import {ProductionRecordId} from "./production-record-id.js";
import {ProductionBatchId} from "./production-batch-id.js";
import {ProductionDetails} from "./production-details.js";

/**
 * Aggregate Root for one production process carried out on a production batch (US-07).
 * The batch it belongs to never changes; its details can be corrected (US-10).
 */
export class ProductionRecord {
    #id;
    #batchId;
    #details;

    /**
     * @param {{id?: ProductionRecordId|null, batchId: ProductionBatchId, details: ProductionDetails}} props
     */
    constructor({id = null, batchId, details}) {
        if (id !== null && !(id instanceof ProductionRecordId)) throw new Error('Invalid production record id.');
        if (!(batchId instanceof ProductionBatchId)) throw new Error('A production record requires its batch.');
        if (!(details instanceof ProductionDetails)) throw new Error('A production record requires its details.');
        this.#id = id;
        this.#batchId = batchId;
        this.#details = details;
    }

    /**
     * @param {{batchId: ProductionBatchId, details: ProductionDetails}} props
     * @returns {ProductionRecord}
     */
    static record({batchId, details}) {
        return new ProductionRecord({id: null, batchId, details});
    }

    get id() {
        return this.#id;
    }

    get batchId() {
        return this.#batchId;
    }

    get details() {
        return this.#details;
    }

    /**
     * Corrects the details of an already registered record, keeping its identity and its batch.
     * Records are immutable, so it returns the corrected record instead of changing this one.
     * @param {ProductionDetails} details
     * @returns {ProductionRecord}
     */
    updateDetails(details) {
        if (this.#id === null) throw new Error('Only a registered production record can be updated.');
        return new ProductionRecord({id: this.#id, batchId: this.#batchId, details});
    }
}
