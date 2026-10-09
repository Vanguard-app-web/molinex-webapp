import {Machine} from "../../domain/model/machine.entity.js";
import {MachineId} from "../../domain/model/machine-id.js";
import {MachineCode} from "../../domain/model/machine-code.js";
import {MachineName} from "../../domain/model/machine-name.js";
import {MachineModel} from "../../domain/model/machine-model.js";
import {StatusChangeDateTime} from "../../domain/model/status-change-date-time.js";

/**
 * Resource exchanged with the /machines endpoint.
 * @typedef {Object} MachineResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} code
 * @property {string} name
 * @property {string} model
 * @property {string} status a MachineStatus.
 * @property {string} statusChangedAt ISO 8601 date and time.
 */

export class MachineAssembler {
    /**
     * @param {MachineResource} resource
     * @returns {Machine}
     */
    static toEntityFromResource(resource) {
        return new Machine({
            id: new MachineId(resource.id),
            code: new MachineCode(resource.code),
            name: new MachineName(resource.name),
            model: new MachineModel(resource.model),
            status: resource.status,
            statusChangedAt: new StatusChangeDateTime(resource.statusChangedAt),
        });
    }

    /**
     * @param {Machine} entity
     * @returns {MachineResource}
     */
    static toResourceFromEntity(entity) {
        const resource = {
            code: entity.code.value,
            name: entity.name.value,
            model: entity.model.value,
            status: entity.status,
            statusChangedAt: entity.statusChangedAt.value.toISOString(),
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {Machine[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['machines'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
