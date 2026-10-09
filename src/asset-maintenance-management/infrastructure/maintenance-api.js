import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const machinesEndpointPath = import.meta.env.VITE_MACHINES_ENDPOINT_PATH;
const maintenanceRecordsEndpointPath = import.meta.env.VITE_MAINTENANCE_RECORDS_ENDPOINT_PATH;

/**
 * HTTP adapter of Asset and Maintenance Management. It sends and receives Resources only.
 */
export class MaintenanceApi extends BaseApi {
    #machinesEndpoint;
    #maintenanceRecordsEndpoint;

    constructor() {
        super();
        this.#machinesEndpoint = new BaseEndpoint(this, machinesEndpointPath);
        this.#maintenanceRecordsEndpoint = new BaseEndpoint(this, maintenanceRecordsEndpointPath);
    }

    getMachines() {
        return this.#machinesEndpoint.getAll();
    }

    createMachine(resource) {
        return this.#machinesEndpoint.create(resource);
    }

    getMaintenanceRecords() {
        return this.#maintenanceRecordsEndpoint.getAll();
    }

    createMaintenanceRecord(resource) {
        return this.#maintenanceRecordsEndpoint.create(resource);
    }
}
