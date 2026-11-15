import {User} from "../../domain/model/user.entity.js";
import {UserId} from "../../domain/model/user-id.js";
import {EmailAddress} from "../../domain/model/email-address.js";
import {FullName} from "../../domain/model/full-name.js";
import {JobTitle} from "../../domain/model/job-title.js";
import {PhoneNumber} from "../../domain/model/phone-number.js";
import {UserProfile} from "../../domain/model/user-profile.js";
import {Role} from "../../domain/model/role.js";

/**
 * Resource exchanged with the users and profile endpoints.
 * @typedef {Object} UserResource
 * @property {string} id
 * @property {string} email
 * @property {string} fullName
 * @property {string} jobTitle empty when not provided.
 * @property {string} phoneNumber empty when not provided.
 * @property {string} role a RoleType.
 * @property {string[]} permissions
 * @property {string} status an AccountStatus.
 */

/**
 * Request an administrator sends to register a user.
 * @typedef {Object} RegisterUserRequest
 * @property {string} email
 * @property {string} password
 * @property {string} fullName
 * @property {string} jobTitle
 * @property {string} phoneNumber
 * @property {string} role a RoleType.
 */

export class UserAssembler {
    /**
     * @param {UserResource} resource
     * @returns {User}
     */
    static toEntity(resource) {
        return new User({
            id: new UserId(resource.id),
            email: new EmailAddress(resource.email),
            profile: new UserProfile({
                fullName: new FullName(resource.fullName),
                jobTitle: new JobTitle(resource.jobTitle ?? ''),
                phoneNumber: new PhoneNumber(resource.phoneNumber ?? ''),
            }),
            role: Role.fromResource(resource.role, resource.permissions),
            status: resource.status,
        });
    }

    /**
     * @param {User} entity
     * @returns {UserResource}
     */
    static toResource(entity) {
        return {
            id: entity.id.value,
            email: entity.email.value,
            fullName: entity.profile.fullName.value,
            jobTitle: entity.profile.jobTitle.value,
            phoneNumber: entity.profile.phoneNumber.value,
            role: entity.role.type,
            permissions: [...entity.role.permissions],
            status: entity.status,
        };
    }

    /**
     * @param {import('axios').AxiosResponse} response
     * @returns {User[]}
     */
    static toEntities(response) {
        const resources = Array.isArray(response.data) ? response.data : response.data['users'];
        return resources.map(resource => this.toEntity(resource));
    }

    /**
     * @param {import('../../application/register-user.command.js').RegisterUserCommand} command
     * @returns {RegisterUserRequest}
     */
    static toRegisterRequest(command) {
        return {
            email: command.email,
            password: command.password,
            fullName: command.fullName,
            jobTitle: command.jobTitle,
            phoneNumber: command.phoneNumber,
            role: command.role,
        };
    }
}
