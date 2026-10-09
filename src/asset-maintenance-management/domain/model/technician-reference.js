/**
 * Value Object for the technician responsible for a maintenance activity.
 * The principal id links to Identity and Access Management; until that context exists
 * it stays null and only the display name is recorded.
 */
export class TechnicianReference {
    static MAX_LENGTH = 100;
    #principalId;
    #displayName;

    /**
     * @param {string} displayName
     * @param {string|null} [principalId]
     */
    constructor(displayName, principalId = null) {
        const normalizedName = typeof displayName === 'string' ? displayName.trim() : '';
        if (!normalizedName || normalizedName.length > TechnicianReference.MAX_LENGTH) {
            throw new Error(`Technician name must contain between 1 and ${TechnicianReference.MAX_LENGTH} characters.`);
        }
        this.#displayName = normalizedName;
        this.#principalId = principalId === null || principalId === undefined ? null : String(principalId);
    }

    get principalId() {
        return this.#principalId;
    }

    get displayName() {
        return this.#displayName;
    }
}
