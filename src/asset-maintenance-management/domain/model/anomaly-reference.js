/**
 * Value Object for the operational anomaly (Operational Intelligence) that led to a corrective
 * maintenance, e.g. "ANM-2026-012". Optional: a failure can be reported without a detected anomaly.
 */
export class AnomalyReference {
    static MAX_LENGTH = 100;
    #anomalyId;

    /** @param {string} anomalyId */
    constructor(anomalyId) {
        const normalizedId = typeof anomalyId === 'string' ? anomalyId.trim() : '';
        if (!normalizedId || normalizedId.length > AnomalyReference.MAX_LENGTH) {
            throw new Error(`Anomaly reference must contain between 1 and ${AnomalyReference.MAX_LENGTH} characters.`);
        }
        this.#anomalyId = normalizedId;
    }

    get anomalyId() {
        return this.#anomalyId;
    }
}
