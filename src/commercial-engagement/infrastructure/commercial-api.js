import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

// The paths default to the mock API contract so a production build keeps working even when the
// environment file of that mode does not define them.
const plansEndpointPath = import.meta.env?.VITE_COMMERCIAL_PLANS_ENDPOINT_PATH || '/commercial/plans';
const valuePropositionEndpointPath = import.meta.env?.VITE_COMMERCIAL_VALUE_PROPOSITION_ENDPOINT_PATH || '/commercial/value-proposition';
const inquiriesEndpointPath = import.meta.env?.VITE_COMMERCIAL_INQUIRIES_ENDPOINT_PATH || '/commercial/inquiries';

/**
 * HTTP adapter of Commercial Engagement. It sends and receives Resources only. Every endpoint is
 * public: no sign-in is needed.
 */
export class CommercialApi extends BaseApi {
    #plansEndpoint;
    #valuePropositionEndpoint;
    #inquiriesEndpoint;

    constructor() {
        super();
        this.#plansEndpoint = new BaseEndpoint(this, plansEndpointPath);
        this.#valuePropositionEndpoint = new BaseEndpoint(this, valuePropositionEndpointPath);
        this.#inquiriesEndpoint = new BaseEndpoint(this, inquiriesEndpointPath);
    }

    getPlans() {
        return this.#plansEndpoint.getAll();
    }

    getValueProposition() {
        return this.#valuePropositionEndpoint.getAll();
    }

    /** @param {import('./assemblers/commercial-inquiry.assembler.js').CommercialInquiryResource} resource */
    createInquiry(resource) {
        return this.#inquiriesEndpoint.create(resource);
    }
}
