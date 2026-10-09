import {ProductionRecordReference} from "../../domain/model/production-record-reference.js";
import {ProductionBatchReference} from "../../domain/model/production-batch-reference.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {Weight} from "../../../production-quality-shared-kernel/domain/model/weight.js";

/**
 * Builds the Read Models Quality and Yield Control keeps about Production Management, from the
 * production-records and production-batches resources. Only the fields Quality needs are read.
 */
export class ProductionReferenceAssembler {
    /**
     * @param {{id: string, batchId: string, processName: string, processedWeight: number, unit: string, startedAt: string}} resource
     * @returns {ProductionRecordReference}
     */
    static toRecordModelFromResource(resource) {
        return new ProductionRecordReference({
            id: new ProductionRecordId(resource.id),
            batchId: resource.batchId,
            processName: resource.processName,
            processedWeight: new Weight(resource.processedWeight, resource.unit),
            startedAt: new Date(resource.startedAt),
        });
    }

    /**
     * @param {{id: string, code: string}} resource
     * @returns {ProductionBatchReference}
     */
    static toBatchModelFromResource(resource) {
        return new ProductionBatchReference({id: resource.id, code: resource.code});
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {ProductionRecordReference[]}
     */
    static toRecordModelsFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['productionRecords'];
        return resources.map(resource => this.toRecordModelFromResource(resource));
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {ProductionBatchReference[]}
     */
    static toBatchModelsFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['productionBatches'];
        return resources.map(resource => this.toBatchModelFromResource(resource));
    }
}
