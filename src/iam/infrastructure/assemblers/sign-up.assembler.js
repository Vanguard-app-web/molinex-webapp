import {UserAssembler} from "./user.assembler.js";

/**
 * Request sent to the sign-up endpoint.
 * @typedef {Object} SignUpRequest
 * @property {string} email
 * @property {string} password
 * @property {string} fullName
 */

export class SignUpAssembler {
    /**
     * @param {import('../../application/sign-up.command.js').SignUpCommand} command
     * @returns {SignUpRequest}
     */
    static toRequest(command) {
        return {email: command.email, password: command.password, fullName: command.fullName};
    }

    /**
     * @param {import('./user.assembler.js').UserResource} resource the account the API created.
     * @returns {import('../../domain/model/user.entity.js').User}
     */
    static toEntity(resource) {
        return UserAssembler.toEntity(resource);
    }
}
