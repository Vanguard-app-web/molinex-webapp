import {FullName} from "./full-name.js";
import {JobTitle} from "./job-title.js";
import {PhoneNumber} from "./phone-number.js";

/**
 * Value Object with the personal information a user can edit.
 */
export class UserProfile {
    #fullName;
    #jobTitle;
    #phoneNumber;

    /**
     * @param {{fullName: FullName, jobTitle?: JobTitle, phoneNumber?: PhoneNumber}} props
     */
    constructor({fullName, jobTitle = new JobTitle(), phoneNumber = new PhoneNumber()}) {
        if (!(fullName instanceof FullName)) throw new Error('A profile requires the full name.');
        if (!(jobTitle instanceof JobTitle)) throw new Error('Invalid job title.');
        if (!(phoneNumber instanceof PhoneNumber)) throw new Error('Invalid phone number.');
        this.#fullName = fullName;
        this.#jobTitle = jobTitle;
        this.#phoneNumber = phoneNumber;
    }

    get fullName() {
        return this.#fullName;
    }

    get jobTitle() {
        return this.#jobTitle;
    }

    get phoneNumber() {
        return this.#phoneNumber;
    }
}
