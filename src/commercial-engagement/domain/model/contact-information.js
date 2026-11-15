import {FullName} from "./full-name.js";
import {EmailAddress} from "./email-address.js";
import {PhoneNumber} from "./phone-number.js";
import {CompanyName} from "./company-name.js";

/**
 * Value Object with the data needed to contact a visitor. The phone is optional.
 */
export class ContactInformation {
    #fullName;
    #email;
    #phone;
    #companyName;

    /**
     * @param {{fullName: FullName, email: EmailAddress, phone?: PhoneNumber|null, companyName: CompanyName}} props
     */
    constructor({fullName, email, phone = null, companyName}) {
        if (!(fullName instanceof FullName)) throw new Error('Contact information requires the full name.');
        if (!(email instanceof EmailAddress)) throw new Error('Contact information requires the email address.');
        if (phone !== null && !(phone instanceof PhoneNumber)) throw new Error('Invalid phone number.');
        if (!(companyName instanceof CompanyName)) throw new Error('Contact information requires the company name.');
        this.#fullName = fullName;
        this.#email = email;
        this.#phone = phone;
        this.#companyName = companyName;
    }

    get fullName() {
        return this.#fullName;
    }

    get email() {
        return this.#email;
    }

    /** @returns {PhoneNumber|null} null when the visitor did not give a phone. */
    get phone() {
        return this.#phone;
    }

    get companyName() {
        return this.#companyName;
    }
}
