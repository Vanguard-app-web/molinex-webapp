import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const rawMaterialReceptionsEndpointPath = import.meta.env.VITE_RAW_MATERIAL_RECEPTIONS_ENDPOINT_PATH;
const productionBatchesEndpointPath = import.meta.env.VITE_PRODUCTION_BATCHES_ENDPOINT_PATH;
const productionRecordsEndpointPath = import.meta.env.VITE_PRODUCTION_RECORDS_ENDPOINT_PATH;

/**
 * HTTP adapter of Production Management. It sends and receives Resources only.
 */
export class ProductionApi extends BaseApi {
    #rawMaterialReceptionsEndpoint;
    #productionBatchesEndpoint;
    #productionRecordsEndpoint;

    constructor() {
        super();
        this.#rawMaterialReceptionsEndpoint = new BaseEndpoint(this, rawMaterialReceptionsEndpointPath);
        this.#productionBatchesEndpoint = new BaseEndpoint(this, productionBatchesEndpointPath);
        this.#productionRecordsEndpoint = new BaseEndpoint(this, productionRecordsEndpointPath);
    }

    getReceptions() {
        return this.#rawMaterialReceptionsEndpoint.getAll();
    }

    createReception(resource) {
        return this.#rawMaterialReceptionsEndpoint.create(resource);
    }

    getBatches() {
        return this.#productionBatchesEndpoint.getAll();
    }

    createBatch(resource) {
        return this.#productionBatchesEndpoint.create(resource);
    }

    getProductionRecords() {
        return this.#productionRecordsEndpoint.getAll();
    }

    createProductionRecord(resource) {
        return this.#productionRecordsEndpoint.create(resource);
    }

    updateProductionRecord(resource) {
        return this.#productionRecordsEndpoint.update(resource.id, resource);
    }
}
