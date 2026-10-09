import {Weight} from "../../../shared/domain/model/weight.js";
import {ProductionRecordId} from "./production-record-id.js";

/**
 * Read Model: what Quality and Yield Control needs to know about a production process owned by
 * Production Management, to relate quality results and waste to it and to calculate waste percentages.
 */
export class ProductionRecordReference {
    #id;
    #batchId;
    #processName;
    #processedWeight;
    #startedAt;

    /**
     * @param {{id: ProductionRecordId, batchId: string, processName: string, processedWeight: Weight, startedAt: Date}} props
     */
    constructor({id, batchId, processName, processedWeight, startedAt}) {
        if (!(id instanceof ProductionRecordId)) throw new Error('A production record reference requires its id.');
        if (!(processedWeight instanceof Weight)) throw new Error('A production record reference requires its processed weight.');
        this.#id = id;
        this.#batchId = String(batchId);
        this.#processName = String(processName);
        this.#processedWeight = processedWeight;
        this.#startedAt = new Date(startedAt);
    }

    get id() {
        return this.#id;
    }

    get batchId() {
        return this.#batchId;
    }

    get processName() {
        return this.#processName;
    }

    get processedWeight() {
        return this.#processedWeight;
    }

    get startedAt() {
        return new Date(this.#startedAt.getTime());
    }
}
