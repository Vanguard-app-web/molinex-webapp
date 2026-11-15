import {PlanId} from "./plan-id.js";
import {PlanName} from "./plan-name.js";
import {PriceLabel} from "./price-label.js";

/**
 * Read Model of a plan the API publishes. The application only displays it.
 */
export class Plan {
    #id;
    #name;
    #price;
    #features;

    /**
     * @param {{id: PlanId, name: PlanName, price: PriceLabel, features: string[]}} props
     */
    constructor({id, name, price, features}) {
        if (!(id instanceof PlanId)) throw new Error('A plan requires its id.');
        if (!(name instanceof PlanName)) throw new Error('A plan requires its name.');
        if (!(price instanceof PriceLabel)) throw new Error('A plan requires its price label.');
        if (!Array.isArray(features) || !features.every(feature => typeof feature === 'string' && feature.trim())) {
            throw new Error('A plan requires its list of features.');
        }
        this.#id = id;
        this.#name = name;
        this.#price = price;
        this.#features = Object.freeze(features.map(feature => feature.trim()));
    }

    get id() {
        return this.#id;
    }

    get name() {
        return this.#name;
    }

    get price() {
        return this.#price;
    }

    get features() {
        return this.#features;
    }
}
