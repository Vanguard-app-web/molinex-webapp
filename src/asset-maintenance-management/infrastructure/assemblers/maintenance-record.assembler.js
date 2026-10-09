import {MaintenanceRecord} from "../../domain/model/maintenance-record.entity.js";
import {MaintenanceRecordId} from "../../domain/model/maintenance-record-id.js";
import {MachineId} from "../../domain/model/machine-id.js";
import {MaintenanceType} from "../../domain/model/maintenance-type.js";
import {MaintenanceDateTime} from "../../domain/model/maintenance-date-time.js";
import {MaintenanceDescription} from "../../domain/model/maintenance-description.js";
import {TechnicianReference} from "../../domain/model/technician-reference.js";
import {AnomalyReference} from "../../domain/model/anomaly-reference.js";
import {CorrectiveMaintenanceDetails} from "../../domain/model/corrective-maintenance-details.js";

/**
 * Resource exchanged with the /maintenance-records endpoint. The corrective fields are null
 * for preventive maintenance.
 * @typedef {Object} MaintenanceRecordResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} machineId
 * @property {string} type a MaintenanceType.
 * @property {string} performedAt ISO 8601 date and time.
 * @property {string} description
 * @property {string|null} technicianId principal id in Identity and Access Management, null until it exists.
 * @property {string} technicianName
 * @property {string|null} anomalyId
 * @property {string|null} failure
 * @property {string|null} cause
 * @property {string|null} actionTaken
 * @property {number|null} downtimeMinutes
 */

export class MaintenanceRecordAssembler {
    /**
     * @param {MaintenanceRecordResource} resource
     * @returns {MaintenanceRecord}
     */
    static toEntityFromResource(resource) {
        return new MaintenanceRecord({
            id: new MaintenanceRecordId(resource.id),
            machineId: new MachineId(resource.machineId),
            type: resource.type,
            performedAt: new MaintenanceDateTime(resource.performedAt),
            description: new MaintenanceDescription(resource.description),
            responsible: new TechnicianReference(resource.technicianName, resource.technicianId),
            anomalyReference: resource.anomalyId ? new AnomalyReference(resource.anomalyId) : null,
            correctiveDetails: resource.type === MaintenanceType.CORRECTIVE
                ? new CorrectiveMaintenanceDetails({
                    failure: resource.failure,
                    cause: resource.cause,
                    actionTaken: resource.actionTaken,
                    downtimeMinutes: resource.downtimeMinutes,
                })
                : null,
        });
    }

    /**
     * @param {MaintenanceRecord} entity
     * @returns {MaintenanceRecordResource}
     */
    static toResourceFromEntity(entity) {
        const details = entity.correctiveDetails;
        const resource = {
            machineId: entity.machineId.value,
            type: entity.type,
            performedAt: entity.performedAt.value.toISOString(),
            description: entity.description.value,
            technicianId: entity.responsible.principalId,
            technicianName: entity.responsible.displayName,
            anomalyId: entity.anomalyReference?.anomalyId ?? null,
            failure: details?.failure ?? null,
            cause: details?.cause ?? null,
            actionTaken: details?.actionTaken ?? null,
            downtimeMinutes: details?.downtimeMinutes ?? null,
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {MaintenanceRecord[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['maintenanceRecords'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
