import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {MaintenanceApi} from "../infrastructure/maintenance-api.js";
import {MachineAssembler} from "../infrastructure/assemblers/machine.assembler.js";
import {MaintenanceRecordAssembler} from "../infrastructure/assemblers/maintenance-record.assembler.js";
import {ApiErrorHandler} from "../../shared/infrastructure/api-error-handler.js";

const maintenanceApi = new MaintenanceApi();

/** @param {{value: string}|string|null|undefined} id an identifier Value Object or its raw value. */
const idValueOf = id => (id === null || id === undefined ? null : String(id.value ?? id));

/**
 * Application state of Asset and Maintenance Management: the machine inventory and its
 * preventive and corrective maintenance history.
 */
const useMaintenanceStore = defineStore('maintenance', () => {
    const machines = shallowRef([]);
    const maintenanceRecords = shallowRef([]);
    /** @type {import('vue').Ref<{operation: string, message: string}[]>} */
    const errors = ref([]);
    const machinesLoaded = ref(false);
    const historyLoaded = ref(false);

    const machinesCount = computed(() => machines.value.length);
    const machinesById = computed(() => new Map(machines.value.map(machine => [machine.id.value, machine])));

    function addErrors(operation, messages) {
        errors.value = [...errors.value, ...messages.map(message => ({operation, message}))];
    }

    function clearErrors(operation) {
        errors.value = operation ? errors.value.filter(error => error.operation !== operation) : [];
    }

    function hasErrors(operation) {
        return errors.value.some(error => error.operation === operation);
    }

    function machineById(id) {
        return machinesById.value.get(idValueOf(id)) ?? null;
    }

    /** @param {import('../domain/model/machine-code.js').MachineCode} code */
    function isMachineCodeTaken(code) {
        return machines.value.some(machine => machine.code.equals(code));
    }

    /** @param {string} status a MachineStatus. */
    function countByStatus(status) {
        return machines.value.filter(machine => machine.status === status).length;
    }

    async function fetchMachines() {
        clearErrors('fetch-machines');
        try {
            const response = await maintenanceApi.getMachines();
            machines.value = MachineAssembler.toEntitiesFromResponse(response);
            machinesLoaded.value = true;
        } catch (error) {
            addErrors('fetch-machines', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchMaintenanceHistory() {
        clearErrors('fetch-maintenance-history');
        try {
            const response = await maintenanceApi.getMaintenanceRecords();
            maintenanceRecords.value = MaintenanceRecordAssembler.toEntitiesFromResponse(response);
            historyLoaded.value = true;
        } catch (error) {
            addErrors('fetch-maintenance-history', ApiErrorHandler.toMessages(error));
        }
    }

    /** Loads whatever has not been loaded yet. */
    function fetchMaintenanceData() {
        return Promise.all([
            machinesLoaded.value ? null : fetchMachines(),
            historyLoaded.value ? null : fetchMaintenanceHistory(),
        ]);
    }

    /**
     * Registers a machine, rejecting a code that another machine already uses.
     * @param {import('../domain/model/machine.entity.js').Machine} machine
     */
    async function registerMachine(machine) {
        clearErrors('register-machine');
        if (!machinesLoaded.value) await fetchMachines();
        if (isMachineCodeTaken(machine.code)) {
            addErrors('register-machine', ['maintenance.errors.duplicate-machine-code']);
            return null;
        }
        try {
            const response = await maintenanceApi.createMachine(MachineAssembler.toResourceFromEntity(machine));
            const registeredMachine = MachineAssembler.toEntityFromResource(response.data);
            machines.value = [...machines.value, registeredMachine];
            return registeredMachine;
        } catch (error) {
            addErrors('register-machine', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Records a preventive or corrective maintenance for a registered machine.
     * @param {import('../domain/model/maintenance-record.entity.js').MaintenanceRecord} record
     */
    async function recordMaintenance(record) {
        clearErrors('record-maintenance');
        if (!machinesLoaded.value) await fetchMachines();
        if (!machineById(record.machineId)) {
            addErrors('record-maintenance', ['maintenance.errors.unknown-machine']);
            return null;
        }
        try {
            const response = await maintenanceApi.createMaintenanceRecord(MaintenanceRecordAssembler.toResourceFromEntity(record));
            const recordedMaintenance = MaintenanceRecordAssembler.toEntityFromResource(response.data);
            maintenanceRecords.value = [...maintenanceRecords.value, recordedMaintenance];
            return recordedMaintenance;
        } catch (error) {
            addErrors('record-maintenance', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    return {
        machines,
        maintenanceRecords,
        errors,
        machinesLoaded,
        historyLoaded,
        machinesCount,
        clearErrors,
        hasErrors,
        machineById,
        isMachineCodeTaken,
        countByStatus,
        fetchMachines,
        fetchMaintenanceHistory,
        fetchMaintenanceData,
        registerMachine,
        recordMaintenance,
    };
});

export default useMaintenanceStore;
