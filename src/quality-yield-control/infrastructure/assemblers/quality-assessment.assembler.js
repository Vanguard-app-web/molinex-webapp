import {QualityAssessment} from "../../domain/model/quality-assessment.entity.js";
import {QualityAssessmentId} from "../../domain/model/quality-assessment-id.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {QualityMeasurement} from "../../domain/model/quality-measurement.js";
import {QualityRange} from "../../domain/model/quality-range.js";
import {Percentage} from "../../domain/model/percentage.js";
import {AssessmentDateTime} from "../../domain/model/assessment-date-time.js";

/**
 * Resource exchanged with the /quality-assessments endpoint.
 * @typedef {Object} QualityAssessmentResource
 * @property {string} [id] assigned by the API; omitted when registering.
 * @property {string} productionRecordId
 * @property {{indicator: string, value: number, expectedMinimum: number, expectedMaximum: number}[]} measurements
 * @property {string} assessedAt ISO 8601 date and time.
 */

export class QualityAssessmentAssembler {
    /**
     * @param {QualityAssessmentResource} resource
     * @returns {QualityAssessment}
     */
    static toEntityFromResource(resource) {
        return new QualityAssessment({
            id: new QualityAssessmentId(resource.id),
            productionRecordId: new ProductionRecordId(resource.productionRecordId),
            measurements: resource.measurements.map(measurement => new QualityMeasurement(
                measurement.indicator,
                new Percentage(measurement.value),
                new QualityRange(new Percentage(measurement.expectedMinimum), new Percentage(measurement.expectedMaximum)))),
            assessedAt: new AssessmentDateTime(resource.assessedAt),
        });
    }

    /**
     * @param {QualityAssessment} entity
     * @returns {QualityAssessmentResource}
     */
    static toResourceFromEntity(entity) {
        const resource = {
            productionRecordId: entity.productionRecordId.value,
            measurements: entity.measurements.map(measurement => ({
                indicator: measurement.indicator,
                value: measurement.value.value,
                expectedMinimum: measurement.expectedRange.minimum.value,
                expectedMaximum: measurement.expectedRange.maximum.value,
            })),
            assessedAt: entity.assessedAt.value.toISOString(),
        };
        return entity.id ? {id: entity.id.value, ...resource} : resource;
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {QualityAssessment[]}
     */
    static toEntitiesFromResponse(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['qualityAssessments'];
        return resources.map(resource => this.toEntityFromResource(resource));
    }
}
