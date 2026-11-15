import {Plan} from "../../domain/model/plan.entity.js";
import {PlanId} from "../../domain/model/plan-id.js";
import {PlanName} from "../../domain/model/plan-name.js";
import {PriceLabel} from "../../domain/model/price-label.js";

/**
 * Resource exchanged with the plans endpoint.
 * @typedef {Object} PlanResource
 * @property {string} id
 * @property {string} name
 * @property {string} priceLabel
 * @property {string[]} features
 */

export class PlanAssembler {
    /**
     * @param {PlanResource} resource
     * @returns {Plan}
     */
    static toEntity(resource) {
        return new Plan({
            id: new PlanId(resource.id),
            name: new PlanName(resource.name),
            price: new PriceLabel(resource.priceLabel),
            features: resource.features,
        });
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {Plan[]}
     */
    static toEntities(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['plans'];
        return resources.map(resource => this.toEntity(resource));
    }
}
