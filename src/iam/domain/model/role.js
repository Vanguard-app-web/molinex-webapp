import {isRoleType} from "./role-type.js";
import {isPermission} from "./permission.js";
import {rolePermissions} from "./role-permissions.js";

/**
 * Value Object that couples a role type with the permissions it grants.
 */
export class Role {
    #type;
    #permissions;

    /**
     * @param {string} type a RoleType.
     * @param {string[]} permissions Permissions the role grants.
     */
    constructor(type, permissions) {
        if (!isRoleType(type)) throw new Error(`Unsupported role type: ${type}.`);
        if (!Array.isArray(permissions) || !permissions.every(isPermission)) throw new Error('A role requires valid permissions.');
        this.#type = type;
        this.#permissions = Object.freeze([...new Set(permissions)]);
    }

    /**
     * Creates a role with the default permissions of its type.
     * @param {string} type a RoleType.
     */
    static of(type) {
        if (!isRoleType(type)) throw new Error(`Unsupported role type: ${type}.`);
        return new Role(type, rolePermissions[type]);
    }

    /**
     * Creates a role from what the API returned. Permissions the application does not know are
     * ignored, so a newer API cannot break the session; the type must still be known.
     * @param {string} type a RoleType.
     * @param {string[]} [permissions]
     */
    static fromResource(type, permissions) {
        if (!Array.isArray(permissions)) return Role.of(type);
        return new Role(type, permissions.filter(isPermission));
    }

    get type() {
        return this.#type;
    }

    get permissions() {
        return this.#permissions;
    }

    /** @param {string} permission a Permission. */
    allows(permission) {
        return this.#permissions.includes(permission);
    }

    /** @param {Role} other */
    equals(other) {
        return other instanceof Role && other.type === this.#type;
    }
}
