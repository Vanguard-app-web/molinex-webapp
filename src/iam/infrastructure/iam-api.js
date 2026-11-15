import {BaseApi} from "../../shared/infrastructure/base-api.js";
import {BaseEndpoint} from "../../shared/infrastructure/base-endpoint.js";

// The paths default to the mock API contract so a production build keeps working even when the
// environment file of that mode does not define them.
const signInEndpointPath = import.meta.env?.VITE_IAM_SIGN_IN_ENDPOINT_PATH || '/iam/sign-in';
const signUpEndpointPath = import.meta.env?.VITE_IAM_SIGN_UP_ENDPOINT_PATH || '/iam/sign-up';
const signOutEndpointPath = import.meta.env?.VITE_IAM_SIGN_OUT_ENDPOINT_PATH || '/iam/sign-out';
const usersEndpointPath = import.meta.env?.VITE_IAM_USERS_ENDPOINT_PATH || '/iam/users';
const profileEndpointPath = import.meta.env?.VITE_IAM_PROFILE_ENDPOINT_PATH || '/iam/profile';

/**
 * HTTP adapter of Identity and Access Management. It sends and receives Resources only.
 */
export class IamApi extends BaseApi {
    #signInEndpoint;
    #signUpEndpoint;
    #signOutEndpoint;
    #usersEndpoint;
    #profileEndpoint;

    constructor() {
        super();
        this.#signInEndpoint = new BaseEndpoint(this, signInEndpointPath);
        this.#signUpEndpoint = new BaseEndpoint(this, signUpEndpointPath);
        this.#signOutEndpoint = new BaseEndpoint(this, signOutEndpointPath);
        this.#usersEndpoint = new BaseEndpoint(this, usersEndpointPath);
        this.#profileEndpoint = new BaseEndpoint(this, profileEndpointPath);
    }

    /** @param {import('./assemblers/sign-in.assembler.js').SignInRequest} request */
    signIn(request) {
        return this.#signInEndpoint.create(request);
    }

    /** @param {import('./assemblers/sign-up.assembler.js').SignUpRequest} request */
    signUp(request) {
        return this.#signUpEndpoint.create(request);
    }

    /** Invalidates the access token the interceptor sends. */
    signOut() {
        return this.#signOutEndpoint.create({});
    }

    getUsers() {
        return this.#usersEndpoint.getAll();
    }

    /** @param {object} request a RegisterUserRequest. */
    createUser(request) {
        return this.#usersEndpoint.create(request);
    }

    /**
     * Updates another user's profile (requires MANAGE_USERS).
     * @param {string} id
     * @param {import('./assemblers/user.assembler.js').UserResource} resource
     */
    updateUser(id, resource) {
        return this.#usersEndpoint.update(id, resource);
    }

    /**
     * @param {string} id
     * @param {string} role a RoleType.
     */
    assignRole(id, role) {
        return this.#usersEndpoint.http.put(`${this.#usersEndpoint.endpointPath}/${id}/role`, {role});
    }

    getProfile() {
        return this.#profileEndpoint.getAll();
    }

    /** @param {import('./assemblers/user.assembler.js').UserResource} resource the current user's resource. */
    updateProfile(resource) {
        return this.#profileEndpoint.http.put(this.#profileEndpoint.endpointPath, resource);
    }
}
