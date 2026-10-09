/**
 * Value Object with what a corrective maintenance documents about the breakdown (US-20):
 * the failure, its cause, the action taken and how long the machine was stopped.
 */
export class CorrectiveMaintenanceDetails {
    static FAILURE_MAX_LENGTH = 250;
    static CAUSE_MAX_LENGTH = 250;
    static ACTION_MAX_LENGTH = 500;
    #failure;
    #cause;
    #actionTaken;
    #downtimeMinutes;

    /**
     * @param {{failure: string, cause: string, actionTaken: string, downtimeMinutes: number}} props
     */
    constructor({failure, cause, actionTaken, downtimeMinutes}) {
        this.#failure = CorrectiveMaintenanceDetails.#requiredText(failure, CorrectiveMaintenanceDetails.FAILURE_MAX_LENGTH, 'Failure');
        this.#cause = CorrectiveMaintenanceDetails.#requiredText(cause, CorrectiveMaintenanceDetails.CAUSE_MAX_LENGTH, 'Cause');
        this.#actionTaken = CorrectiveMaintenanceDetails.#requiredText(actionTaken, CorrectiveMaintenanceDetails.ACTION_MAX_LENGTH, 'Action taken');
        if (!Number.isInteger(downtimeMinutes) || downtimeMinutes < 0) {
            throw new Error('Downtime must be a whole number of minutes, zero or greater.');
        }
        this.#downtimeMinutes = downtimeMinutes;
    }

    static #requiredText(value, maxLength, label) {
        const normalizedValue = typeof value === 'string' ? value.trim() : '';
        if (!normalizedValue || normalizedValue.length > maxLength) {
            throw new Error(`${label} must contain between 1 and ${maxLength} characters.`);
        }
        return normalizedValue;
    }

    get failure() {
        return this.#failure;
    }

    get cause() {
        return this.#cause;
    }

    get actionTaken() {
        return this.#actionTaken;
    }

    get downtimeMinutes() {
        return this.#downtimeMinutes;
    }
}
