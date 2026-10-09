import {MaintenanceRecordId} from "./maintenance-record-id.js";
import {MachineId} from "./machine-id.js";
import {MaintenanceType, isMaintenanceType} from "./maintenance-type.js";
import {MaintenanceDateTime} from "./maintenance-date-time.js";
import {MaintenanceDescription} from "./maintenance-description.js";
import {TechnicianReference} from "./technician-reference.js";
import {AnomalyReference} from "./anomaly-reference.js";
import {CorrectiveMaintenanceDetails} from "./corrective-maintenance-details.js";

/**
 * Aggregate Root for a preventive (US-19) or corrective (US-20) maintenance activity
 * performed on a machine, which it references by identity.
 * Corrective maintenance always documents its failure, cause, action and downtime;
 * preventive maintenance never does.
 */
export class MaintenanceRecord {
    #id;
    #machineId;
    #type;
    #performedAt;
    #description;
    #responsible;
    #anomalyReference;
    #correctiveDetails;

    /**
     * @param {{id?: MaintenanceRecordId|null, machineId: MachineId, type: string, performedAt: MaintenanceDateTime,
     *          description: MaintenanceDescription, responsible: TechnicianReference,
     *          anomalyReference?: AnomalyReference|null, correctiveDetails?: CorrectiveMaintenanceDetails|null}} props
     */
    constructor({id = null, machineId, type, performedAt, description, responsible,
                    anomalyReference = null, correctiveDetails = null}) {
        if (id !== null && !(id instanceof MaintenanceRecordId)) throw new Error('Invalid maintenance record id.');
        if (!(machineId instanceof MachineId)) throw new Error('A maintenance record requires its machine.');
        if (!isMaintenanceType(type)) throw new Error(`Unsupported maintenance type: ${type}.`);
        if (!(performedAt instanceof MaintenanceDateTime)) throw new Error('A maintenance record requires its date.');
        if (!(description instanceof MaintenanceDescription)) throw new Error('A maintenance record requires its description.');
        if (!(responsible instanceof TechnicianReference)) throw new Error('A maintenance record requires its responsible technician.');
        if (anomalyReference !== null && !(anomalyReference instanceof AnomalyReference)) throw new Error('Invalid anomaly reference.');
        if (correctiveDetails !== null && !(correctiveDetails instanceof CorrectiveMaintenanceDetails)) {
            throw new Error('Invalid corrective maintenance details.');
        }
        if (type === MaintenanceType.CORRECTIVE && correctiveDetails === null) {
            throw new Error('Corrective maintenance requires its failure, cause, action taken and downtime.');
        }
        if (type === MaintenanceType.PREVENTIVE && correctiveDetails !== null) {
            throw new Error('Preventive maintenance does not document a failure.');
        }
        this.#id = id;
        this.#machineId = machineId;
        this.#type = type;
        this.#performedAt = performedAt;
        this.#description = description;
        this.#responsible = responsible;
        this.#anomalyReference = anomalyReference;
        this.#correctiveDetails = correctiveDetails;
    }

    /**
     * @param {{machineId: MachineId, performedAt: MaintenanceDateTime, description: MaintenanceDescription,
     *          responsible: TechnicianReference}} props
     * @returns {MaintenanceRecord}
     */
    static recordPreventive({machineId, performedAt, description, responsible}) {
        return new MaintenanceRecord({
            id: null, machineId, type: MaintenanceType.PREVENTIVE, performedAt, description, responsible,
        });
    }

    /**
     * The action taken becomes the description of the activity.
     * @param {{machineId: MachineId, performedAt: MaintenanceDateTime, responsible: TechnicianReference,
     *          correctiveDetails: CorrectiveMaintenanceDetails, anomalyReference?: AnomalyReference|null}} props
     * @returns {MaintenanceRecord}
     */
    static recordCorrective({machineId, performedAt, responsible, correctiveDetails, anomalyReference = null}) {
        if (!(correctiveDetails instanceof CorrectiveMaintenanceDetails)) {
            throw new Error('Corrective maintenance requires its failure, cause, action taken and downtime.');
        }
        return new MaintenanceRecord({
            id: null, machineId, type: MaintenanceType.CORRECTIVE, performedAt,
            description: new MaintenanceDescription(correctiveDetails.actionTaken),
            responsible, anomalyReference, correctiveDetails,
        });
    }

    get id() {
        return this.#id;
    }

    get machineId() {
        return this.#machineId;
    }

    get type() {
        return this.#type;
    }

    get performedAt() {
        return this.#performedAt;
    }

    get description() {
        return this.#description;
    }

    get responsible() {
        return this.#responsible;
    }

    get anomalyReference() {
        return this.#anomalyReference;
    }

    get correctiveDetails() {
        return this.#correctiveDetails;
    }

    isCorrective() {
        return this.#type === MaintenanceType.CORRECTIVE;
    }
}
