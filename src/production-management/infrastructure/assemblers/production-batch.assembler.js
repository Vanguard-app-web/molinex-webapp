import {ProductionBatch} from "../../domain/model/production-batch.entity.js";
import {ProductionBatchId} from "../../domain/model/production-batch-id.js";
import {BatchCode} from "../../domain/model/batch-code.js";
import {RawMaterialReceptionId} from "../../domain/model/raw-material-reception-id.js";
import {BatchRegistrationDateTime} from "../../domain/model/batch-registration-date-time.js";

/**
 * Resource exchanged with the /production-batches endpoint.
 * @typedef {Object} ProductionBatchResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} code
 * @property {string} receptionId
 * @property {string} registeredAt ISO 8601 date and time.
 */

export class ProductionBatchAssembler {
    /**
     * @param {ProductionBatchResource} resource
     * @returns {ProductionBatch}
     */
    static toEntityFromResource(resource) {
        return new ProductionBatch({
            id: new ProductionBatchId(resource.id),
            code: new BatchCode(resource.code),
            receptionId: new RawMaterialReceptionId(resource.receptionId),
            registeredAt: new BatchRegistrationDateTime(resource.registeredAt),
        });
    }

    /**
     * @param {ProductionBatch} entity
     * @returns {ProductionBatchResource}
     */
    static toResourceFromEntity(entity) {
        const resource = {
            code: entity.code.value,
            receptionId: entity.receptionId.value,
            registeredAt: entity.registeredAt.value.toISOString(),
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {ProductionBatch[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['productionBatches'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
