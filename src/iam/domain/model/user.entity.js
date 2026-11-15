import {UserId} from "./user-id.js";
import {EmailAddress} from "./email-address.js";
import {UserProfile} from "./user-profile.js";
import {Role} from "./role.js";
import {isAccountStatus} from "./account-status.js";

/**
 * Aggregate Root for a person who can sign in to Molinex. Only the role and the profile can
 * change through the domain; the email and the account status are fixed once the user exists.
 */
export class User {
    #id;
    #email;
    #profile;
    #role;
    #status;

    /**
     * @param {{id: UserId, email: EmailAddress, profile: UserProfile, role: Role, status: string}} props
     */
    constructor({id, email, profile, role, status}) {
        if (!(id instanceof UserId)) throw new Error('A user requires its id.');
        if (!(email instanceof EmailAddress)) throw new Error('A user requires its email address.');
        if (!(profile instanceof UserProfile)) throw new Error('A user requires its profile.');
        if (!(role instanceof Role)) throw new Error('A user requires its role.');
        if (!isAccountStatus(status)) throw new Error(`Unsupported account status: ${status}.`);
        this.#id = id;
        this.#email = email;
        this.#profile = profile;
        this.#role = role;
        this.#status = status;
    }

    get id() {
        return this.#id;
    }

    get email() {
        return this.#email;
    }

    get profile() {
        return this.#profile;
    }

    get role() {
        return this.#role;
    }

    get status() {
        return this.#status;
    }

    /** @param {Role} role */
    assignRole(role) {
        if (!(role instanceof Role)) throw new Error('A role is required.');
        this.#role = role;
    }

    /** @param {UserProfile} profile */
    updateProfile(profile) {
        if (!(profile instanceof UserProfile)) throw new Error('A profile is required.');
        this.#profile = profile;
    }
}
