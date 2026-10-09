import {QualityAssessmentId} from "./quality-assessment-id.js";
import {ProductionRecordId} from "./production-record-id.js";
import {QualityMeasurement} from "./quality-measurement.js";
import {AssessmentDateTime} from "./assessment-date-time.js";
import {QualityIndicator} from "./quality-indicator.js";
import {Percentage} from "./percentage.js";

/**
 * Aggregate Root for the quality results recorded for one production process (US-11).
 * It references the production record by identity only.
 */
export class QualityAssessment {
    #id;
    #productionRecordId;
    #measurements;
    #assessedAt;

    /**
     * @param {{id?: QualityAssessmentId|null, productionRecordId: ProductionRecordId,
     *          measurements: QualityMeasurement[], assessedAt: AssessmentDateTime}} props
     */
    constructor({id = null, productionRecordId, measurements, assessedAt}) {
        if (id !== null && !(id instanceof QualityAssessmentId)) throw new Error('Invalid quality assessment id.');
        if (!(productionRecordId instanceof ProductionRecordId)) throw new Error('A quality assessment requires its production record.');
        if (!Array.isArray(measurements) || measurements.length === 0
            || !measurements.every(measurement => measurement instanceof QualityMeasurement)) {
            throw new Error('A quality assessment requires at least one quality measurement.');
        }
        const indicators = measurements.map(measurement => measurement.indicator);
        if (new Set(indicators).size !== indicators.length) throw new Error('Each quality indicator can be measured only once.');
        if (!(assessedAt instanceof AssessmentDateTime)) throw new Error('A quality assessment requires its assessment date.');
        this.#id = id;
        this.#productionRecordId = productionRecordId;
        this.#measurements = Object.freeze([...measurements]);
        this.#assessedAt = assessedAt;
        if (!this.hasValidPercentages()) {
            throw new Error('Quality values must be within their expected range, and whole plus broken grain cannot exceed 100 %.');
        }
    }

    /**
     * @param {{productionRecordId: ProductionRecordId, measurements: QualityMeasurement[], assessedAt: AssessmentDateTime}} props
     * @returns {QualityAssessment}
     */
    static record({productionRecordId, measurements, assessedAt}) {
        return new QualityAssessment({id: null, productionRecordId, measurements, assessedAt});
    }

    get id() {
        return this.#id;
    }

    get productionRecordId() {
        return this.#productionRecordId;
    }

    /** @returns {readonly QualityMeasurement[]} */
    get measurements() {
        return this.#measurements;
    }

    get assessedAt() {
        return this.#assessedAt;
    }

    /**
     * @param {string} indicator a {@link QualityIndicator}.
     * @returns {number|null} the measured percentage, or null when that indicator was not measured.
     */
    measurementValue(indicator) {
        return this.#measurements.find(measurement => measurement.indicator === indicator)?.value.value ?? null;
    }

    /** Every value lies within its expected range and whole plus broken grain does not exceed the whole sample. */
    hasValidPercentages() {
        const wholeGrain = this.measurementValue(QualityIndicator.WHOLE_GRAIN_PERCENTAGE) ?? 0;
        const brokenGrain = this.measurementValue(QualityIndicator.BROKEN_GRAIN_PERCENTAGE) ?? 0;
        return this.#measurements.every(measurement => !measurement.isOutsideExpectedRange())
            && wholeGrain + brokenGrain <= Percentage.MAXIMUM;
    }
}
