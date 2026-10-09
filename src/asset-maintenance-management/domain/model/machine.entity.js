import {MachineId} from "./machine-id.js";
import {MachineCode} from "./machine-code.js";
import {MachineName} from "./machine-name.js";
import {MachineModel} from "./machine-model.js";
import {isMachineStatus} from "./machine-status.js";
import {StatusChangeDateTime} from "./status-change-date-time.js";

/**
 * Aggregate Root for a machine of the mill inventory (US-17).
 */
export class Machine {
    #id;
    #code;
    #name;
    #model;
    #status;
    #statusChangedAt;

    /**
     * @param {{id?: MachineId|null, code: MachineCode, name: MachineName, model: MachineModel,
     *          status: string, statusChangedAt: StatusChangeDateTime}} props
     */
    constructor({id = null, code, name, model, status, statusChangedAt}) {
        if (id !== null && !(id instanceof MachineId)) throw new Error('Invalid machine id.');
        if (!(code instanceof MachineCode)) throw new Error('A machine requires its code.');
        if (!(name instanceof MachineName)) throw new Error('A machine requires its name.');
        if (!(model instanceof MachineModel)) throw new Error('A machine requires its model.');
        if (!isMachineStatus(status)) throw new Error(`Unsupported machine status: ${status}.`);
        if (!(statusChangedAt instanceof StatusChangeDateTime)) throw new Error('A machine requires the date of its current status.');
        this.#id = id;
        this.#code = code;
        this.#name = name;
        this.#model = model;
        this.#status = status;
        this.#statusChangedAt = statusChangedAt;
    }

    /**
     * Registers a new machine. Code uniqueness spans the whole inventory, so the application store
     * checks it before calling the API.
     * @param {{code: MachineCode, name: MachineName, model: MachineModel, status: string, statusChangedAt: StatusChangeDateTime}} props
     * @returns {Machine}
     */
    static register({code, name, model, status, statusChangedAt}) {
        return new Machine({id: null, code, name, model, status, statusChangedAt});
    }

    get id() {
        return this.#id;
    }

    get code() {
        return this.#code;
    }

    get name() {
        return this.#name;
    }

    get model() {
        return this.#model;
    }

    get status() {
        return this.#status;
    }

    get statusChangedAt() {
        return this.#statusChangedAt;
    }
}
