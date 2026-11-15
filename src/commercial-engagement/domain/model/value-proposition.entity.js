import {PropositionHeadline} from "./proposition-headline.js";

/**
 * Read Model of the value proposition the API publishes. The application only displays it.
 */
export class ValueProposition {
    #headline;
    #benefits;

    /**
     * @param {{headline: PropositionHeadline, benefits: string[]}} props
     */
    constructor({headline, benefits}) {
        if (!(headline instanceof PropositionHeadline)) throw new Error('A value proposition requires its headline.');
        if (!Array.isArray(benefits) || !benefits.every(benefit => typeof benefit === 'string' && benefit.trim())) {
            throw new Error('A value proposition requires its list of benefits.');
        }
        this.#headline = headline;
        this.#benefits = Object.freeze(benefits.map(benefit => benefit.trim()));
    }

    get headline() {
        return this.#headline;
    }

    get benefits() {
        return this.#benefits;
    }
}
