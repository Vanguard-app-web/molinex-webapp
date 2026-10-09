import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

const qualityAssessmentsEndpointPath = import.meta.env.VITE_QUALITY_ASSESSMENTS_ENDPOINT_PATH;
const wasteRecordsEndpointPath = import.meta.env.VITE_WASTE_RECORDS_ENDPOINT_PATH;
const productionRecordsEndpointPath = import.meta.env.VITE_PRODUCTION_RECORDS_ENDPOINT_PATH;
const productionBatchesEndpointPath = import.meta.env.VITE_PRODUCTION_BATCHES_ENDPOINT_PATH;

/**
 * HTTP adapter of Quality and Yield Control. Besides its own resources it reads, never writes,
 * the production records and batches it refers to by identity.
 */
export class QualityApi extends BaseApi {
    #assessmentsEndpoint;
    #wasteEndpoint;
    #productionRecordsEndpoint;
    #productionBatchesEndpoint;

    constructor() {
        super();
        this.#assessmentsEndpoint = new BaseEndpoint(this, qualityAssessmentsEndpointPath);
        this.#wasteEndpoint = new BaseEndpoint(this, wasteRecordsEndpointPath);
        this.#productionRecordsEndpoint = new BaseEndpoint(this, productionRecordsEndpointPath);
        this.#productionBatchesEndpoint = new BaseEndpoint(this, productionBatchesEndpointPath);
    }

    getAssessments() {
        return this.#assessmentsEndpoint.getAll();
    }

    createAssessment(resource) {
        return this.#assessmentsEndpoint.create(resource);
    }

    getWasteRecords() {
        return this.#wasteEndpoint.getAll();
    }

    createWasteRecord(resource) {
        return this.#wasteEndpoint.create(resource);
    }

    getProductionRecordReferences() {
        return this.#productionRecordsEndpoint.getAll();
    }

    getProductionBatchReferences() {
        return this.#productionBatchesEndpoint.getAll();
    }
}
