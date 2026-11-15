import {AuthenticatedSession} from "../../domain/model/authenticated-session.js";
import {AccessToken} from "../../domain/model/access-token.js";
import {Role} from "../../domain/model/role.js";
import {UserId} from "../../domain/model/user-id.js";

/**
 * Request sent to the sign-in endpoint.
 * @typedef {Object} SignInRequest
 * @property {string} email
 * @property {string} password
 */

/**
 * Resource returned by the sign-in endpoint.
 * @typedef {Object} SignInResource
 * @property {string} userId
 * @property {string} token
 * @property {string} role a RoleType.
 * @property {string[]} permissions
 */

export class SignInAssembler {
    /**
     * @param {import('../../application/sign-in.command.js').SignInCommand} command
     * @returns {SignInRequest}
     */
    static toRequest(command) {
        return {email: command.email, password: command.password};
    }

    /**
     * @param {SignInResource} resource
     * @returns {AuthenticatedSession}
     */
    static toSession(resource) {
        return new AuthenticatedSession({
            userId: new UserId(resource.userId),
            token: new AccessToken(resource.token),
            role: Role.fromResource(resource.role, resource.permissions),
        });
    }
}
