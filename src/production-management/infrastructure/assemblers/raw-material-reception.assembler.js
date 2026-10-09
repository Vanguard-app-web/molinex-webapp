import {RawMaterialReception} from "../../domain/model/raw-material-reception.entity.js";
import {RawMaterialReceptionId} from "../../domain/model/raw-material-reception-id.js";
import {ReceptionDateTime} from "../../domain/model/reception-date-time.js";
import {Supplier} from "../../domain/model/supplier.js";
import {MaterialOrigin} from "../../domain/model/material-origin.js";
import {Weight} from "../../../shared/domain/model/weight.js";

/**
 * Resource exchanged with the /raw-material-receptions endpoint.
 * @typedef {Object} RawMaterialReceptionResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} receivedAt ISO 8601 date and time.
 * @property {string} supplier
 * @property {string} origin
 * @property {number} quantity
 * @property {string} unit a MeasurementUnit.
 */

export class RawMaterialReceptionAssembler {
    /**
     * @param {RawMaterialReceptionResource} resource
     * @returns {RawMaterialReception}
     */
    static toEntityFromResource(resource) {
        return new RawMaterialReception({
            id: new RawMaterialReceptionId(resource.id),
            receivedAt: new ReceptionDateTime(resource.receivedAt),
            supplier: new Supplier(resource.supplier),
            origin: new MaterialOrigin(resource.origin),
            quantity: new Weight(resource.quantity, resource.unit),
        });
    }

    /**
     * @param {RawMaterialReception} entity
     * @returns {RawMaterialReceptionResource}
     */
    static toResourceFromEntity(entity) {
        const resource = {
            receivedAt: entity.receivedAt.value.toISOString(),
            supplier: entity.supplier.name,
            origin: entity.origin.description,
            quantity: entity.quantity.value,
            unit: entity.quantity.unit,
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {RawMaterialReception[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['rawMaterialReceptions'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
