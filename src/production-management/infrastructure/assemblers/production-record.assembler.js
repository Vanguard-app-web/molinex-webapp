import {ProductionRecord} from "../../domain/model/production-record.entity.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {ProductionBatchId} from "../../domain/model/production-batch-id.js";
import {ProductionDetails} from "../../domain/model/production-details.js";
import {ProductionProcessName} from "../../domain/model/production-process-name.js";
import {ProductionPeriod} from "../../domain/model/production-period.js";
import {Weight} from "../../../production-quality-shared-kernel/domain/model/weight.js";

/**
 * Resource exchanged with the /production-records endpoint.
 * @typedef {Object} ProductionRecordResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} batchId
 * @property {string} processName
 * @property {number} processedWeight
 * @property {string} unit a MeasurementUnit.
 * @property {string} startedAt ISO 8601 date and time.
 * @property {string|null} finishedAt ISO 8601 date and time, null while the process runs.
 * @property {string} status a ProductionStatus.
 */

export class ProductionRecordAssembler {
    /**
     * @param {ProductionRecordResource} resource
     * @returns {ProductionRecord}
     */
    static toEntityFromResource(resource) {
        return new ProductionRecord({
            id: new ProductionRecordId(resource.id),
            batchId: new ProductionBatchId(resource.batchId),
            details: new ProductionDetails({
                processName: new ProductionProcessName(resource.processName),
                processedWeight: new Weight(resource.processedWeight, resource.unit),
                period: new ProductionPeriod(
                    new Date(resource.startedAt),
                    resource.finishedAt ? new Date(resource.finishedAt) : null),
                status: resource.status,
            }),
        });
    }

    /**
     * @param {ProductionRecord} entity
     * @returns {ProductionRecordResource}
     */
    static toResourceFromEntity(entity) {
        const {details} = entity;
        const resource = {
            batchId: entity.batchId.value,
            processName: details.processName.value,
            processedWeight: details.processedWeight.value,
            unit: details.processedWeight.unit,
            startedAt: details.period.startedAt.toISOString(),
            finishedAt: details.period.finishedAt?.toISOString() ?? null,
            status: details.status,
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {ProductionRecord[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['productionRecords'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
