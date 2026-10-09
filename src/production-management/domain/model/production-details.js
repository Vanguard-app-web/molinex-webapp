import {Weight} from "../../../shared/domain/model/weight.js";
import {ProductionProcessName} from "./production-process-name.js";
import {ProductionPeriod} from "./production-period.js";
import {isProductionStatus} from "./production-status.js";

/**
 * Value Object with the information captured for one production process:
 * which process ran, how much rice it processed, when, and its status.
 */
export class ProductionDetails {
    #processName;
    #processedWeight;
    #period;
    #status;

    /**
     * @param {{processName: ProductionProcessName, processedWeight: Weight, period: ProductionPeriod, status: string}} props
     */
    constructor({processName, processedWeight, period, status}) {
        if (!(processName instanceof ProductionProcessName)) throw new Error('Production details require a process name.');
        if (!(processedWeight instanceof Weight) || !processedWeight.isPositive()) {
            throw new Error('Processed weight must be greater than zero.');
        }
        if (!(period instanceof ProductionPeriod)) throw new Error('Production details require a production period.');
        if (!isProductionStatus(status)) throw new Error(`Unsupported production status: ${status}.`);
        this.#processName = processName;
        this.#processedWeight = processedWeight;
        this.#period = period;
        this.#status = status;
    }

    get processName() {
        return this.#processName;
    }

    get processedWeight() {
        return this.#processedWeight;
    }

    get period() {
        return this.#period;
    }

    get status() {
        return this.#status;
    }
}
