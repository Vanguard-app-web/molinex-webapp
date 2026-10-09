import {WasteRecord} from "../../domain/model/waste-record.entity.js";
import {WasteRecordId} from "../../domain/model/waste-record-id.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {Weight} from "../../../production-quality-shared-kernel/domain/model/weight.js";

/**
 * Resource exchanged with the /waste-records endpoint.
 * @typedef {Object} WasteRecordResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} productionRecordId
 * @property {number} quantityValue
 * @property {string} quantityUnit a MeasurementUnit.
 * @property {number|null} baseWeightValue processed weight of the production record.
 * @property {string|null} baseWeightUnit
 * @property {number|null} percentage calculated by the domain; sent so the API keeps it.
 * @property {string} recordedAt ISO 8601 date and time.
 */

export class WasteRecordAssembler {
    /**
     * @param {WasteRecordResource} resource
     * @returns {WasteRecord}
     */
    static toEntityFromResource(resource) {
        const hasBaseWeight = resource.baseWeightValue !== null && resource.baseWeightValue !== undefined
            && resource.baseWeightUnit !== null && resource.baseWeightUnit !== undefined;
        return new WasteRecord({
            id: new WasteRecordId(resource.id),
            productionRecordId: new ProductionRecordId(resource.productionRecordId),
            quantity: new Weight(resource.quantityValue, resource.quantityUnit),
            baseWeight: hasBaseWeight ? new Weight(resource.baseWeightValue, resource.baseWeightUnit) : null,
            recordedAt: new Date(resource.recordedAt),
        });
    }

    /**
     * @param {WasteRecord} entity
     * @returns {WasteRecordResource}
     */
    static toResourceFromEntity(entity) {
        const resource = {
            productionRecordId: entity.productionRecordId.value,
            quantityValue: entity.quantity.value,
            quantityUnit: entity.quantity.unit,
            baseWeightValue: entity.baseWeight?.value ?? null,
            baseWeightUnit: entity.baseWeight?.unit ?? null,
            percentage: entity.percentage?.value ?? null,
            recordedAt: entity.recordedAt.toISOString(),
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {WasteRecord[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['wasteRecords'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
