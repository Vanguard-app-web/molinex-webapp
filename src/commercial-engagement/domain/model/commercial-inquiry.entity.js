import {CommercialInquiryId} from "./commercial-inquiry-id.js";
import {ContactInformation} from "./contact-information.js";
import {InquiryMessage} from "./inquiry-message.js";
import {SubmissionDateTime} from "./submission-date-time.js";

/**
 * Aggregate Root for a visitor's request to be contacted. It is born as a draft without identity;
 * only the API gives it an id and a submission time, which makes it a stored inquiry.
 */
export class CommercialInquiry {
    #id;
    #contact;
    #message;
    #submittedAt;

    /**
     * @param {{id?: CommercialInquiryId|null, contact: ContactInformation, message: InquiryMessage,
     *          submittedAt?: SubmissionDateTime|null}} props
     */
    constructor({id = null, contact, message, submittedAt = null}) {
        if (id !== null && !(id instanceof CommercialInquiryId)) throw new Error('Invalid inquiry id.');
        if (!(contact instanceof ContactInformation)) throw new Error('An inquiry requires the contact information.');
        if (!(message instanceof InquiryMessage)) throw new Error('An inquiry requires the message.');
        if (submittedAt !== null && !(submittedAt instanceof SubmissionDateTime)) throw new Error('Invalid submission time.');
        if ((id === null) !== (submittedAt === null)) throw new Error('A stored inquiry has both an id and a submission time.');
        this.#id = id;
        this.#contact = contact;
        this.#message = message;
        this.#submittedAt = submittedAt;
    }

    /**
     * Prepares a visitor's inquiry to be sent. The API assigns the id and the submission time when
     * it stores the inquiry, so the draft has neither.
     * @param {{contact: ContactInformation, message: InquiryMessage}} props
     * @returns {CommercialInquiry}
     */
    static submit({contact, message}) {
        return new CommercialInquiry({id: null, contact, message, submittedAt: null});
    }

    /** @returns {CommercialInquiryId|null} null until the API stores the inquiry. */
    get id() {
        return this.#id;
    }

    get contact() {
        return this.#contact;
    }

    get message() {
        return this.#message;
    }

    /** @returns {SubmissionDateTime|null} null until the API stores the inquiry. */
    get submittedAt() {
        return this.#submittedAt;
    }

    /** True once the API has stored the inquiry. */
    get isStored() {
        return this.#id !== null;
    }
}
