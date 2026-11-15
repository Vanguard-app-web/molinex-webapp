import {ValueProposition} from "../../domain/model/value-proposition.entity.js";
import {PropositionHeadline} from "../../domain/model/proposition-headline.js";

/**
 * Resource exchanged with the value proposition endpoint.
 * @typedef {Object} ValuePropositionResource
 * @property {string} headline
 * @property {string[]} benefits
 */

export class ValuePropositionAssembler {
    /**
     * @param {ValuePropositionResource} resource
     * @returns {ValueProposition}
     */
    static toEntity(resource) {
        return new ValueProposition({
            headline: new PropositionHeadline(resource.headline),
            benefits: resource.benefits,
        });
    }
}
