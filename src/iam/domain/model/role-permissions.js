import {RoleType} from "./role-type.js";
import {Permission} from "./permission.js";

/**
 * Default permissions of each role, used to preview a role before assigning it. The API is the
 * authority: the permissions it returns for a user or a session always take precedence.
 *
 * The matrix is derived from the C4 actors: the administrator administers users and supervises
 * operations and reports; the maintenance technician manages machines and maintenance work; the
 * production operator records production, quality and waste information. Every role can read
 * operational information. It must match the matrix of the mock API (see the README).
 */
export const rolePermissions = Object.freeze({
    [RoleType.ADMINISTRATOR]: Object.freeze([
        Permission.MANAGE_USERS,
        Permission.VIEW_OPERATIONAL_INFORMATION,
        Permission.VIEW_REPORTS,
    ]),
    [RoleType.MAINTENANCE_TECHNICIAN]: Object.freeze([
        Permission.MANAGE_MAINTENANCE,
        Permission.VIEW_OPERATIONAL_INFORMATION,
    ]),
    [RoleType.PRODUCTION_OPERATOR]: Object.freeze([
        Permission.MANAGE_PRODUCTION,
        Permission.VIEW_OPERATIONAL_INFORMATION,
    ]),
});

/** Role that public sign-up assigns; the API decides it, this only lets the form announce it. */
export const DEFAULT_SIGN_UP_ROLE = RoleType.PRODUCTION_OPERATOR;
