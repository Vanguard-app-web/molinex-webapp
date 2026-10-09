/**
 * Value Object for the time span of a production process. The finish is optional while the
 * process runs, and it can never precede the start.
 */
export class ProductionPeriod {
    #startedAt;
    #finishedAt;

    /**
     * @param {Date} startedAt
     * @param {Date|null} [finishedAt]
     */
    constructor(startedAt, finishedAt = null) {
        if (!(startedAt instanceof Date) || Number.isNaN(startedAt.getTime())) {
            throw new Error('A production period requires a valid start date and time.');
        }
        if (finishedAt !== null && (!(finishedAt instanceof Date) || Number.isNaN(finishedAt.getTime()))) {
            throw new Error('The finish of a production period must be a valid date and time.');
        }
        this.#startedAt = new Date(startedAt.getTime());
        this.#finishedAt = finishedAt ? new Date(finishedAt.getTime()) : null;
        if (!this.isChronologicallyValid()) throw new Error('A production process cannot finish before it starts.');
    }

    get startedAt() {
        return new Date(this.#startedAt.getTime());
    }

    get finishedAt() {
        return this.#finishedAt ? new Date(this.#finishedAt.getTime()) : null;
    }

    isChronologicallyValid() {
        return this.#finishedAt === null || this.#finishedAt.getTime() >= this.#startedAt.getTime();
    }
}
