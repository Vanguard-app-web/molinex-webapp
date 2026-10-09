import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {ProductionApi} from "../infrastructure/production-api.js";
import {RawMaterialReceptionAssembler} from "../infrastructure/assemblers/raw-material-reception.assembler.js";
import {ProductionBatchAssembler} from "../infrastructure/assemblers/production-batch.assembler.js";
import {ProductionRecordAssembler} from "../infrastructure/assemblers/production-record.assembler.js";
import {ApiErrorHandler} from "../../shared/infrastructure/api-error-handler.js";

const productionApi = new ProductionApi();

/** @param {{value: string}|string|null|undefined} id an identifier Value Object or its raw value. */
const idValueOf = id => (id === null || id === undefined ? null : String(id.value ?? id));

/**
 * Application state of Production Management: raw material receptions, production batches and
 * production records. Views read this state and call these actions; none of them calls the API.
 */
const useProductionStore = defineStore('production', () => {
    const receptions = shallowRef([]);
    const batches = shallowRef([]);
    const productionRecords = shallowRef([]);
    /** @type {import('vue').Ref<{operation: string, message: string}[]>} */
    const errors = ref([]);
    const receptionsLoaded = ref(false);
    const batchesLoaded = ref(false);
    const recordsLoaded = ref(false);

    const receptionsCount = computed(() => receptions.value.length);
    const batchesCount = computed(() => batches.value.length);
    const productionRecordsCount = computed(() => productionRecords.value.length);
    const receptionsById = computed(() => new Map(receptions.value.map(reception => [reception.id.value, reception])));
    const batchesById = computed(() => new Map(batches.value.map(batch => [batch.id.value, batch])));
    const recordsByBatchId = computed(() => {
        const groups = new Map();
        for (const record of productionRecords.value) {
            groups.set(record.batchId.value, [...(groups.get(record.batchId.value) ?? []), record]);
        }
        return groups;
    });

    function addErrors(operation, messages) {
        errors.value = [...errors.value, ...messages.map(message => ({operation, message}))];
    }

    function clearErrors(operation) {
        errors.value = operation ? errors.value.filter(error => error.operation !== operation) : [];
    }

    function hasErrors(operation) {
        return errors.value.some(error => error.operation === operation);
    }

    function receptionById(id) {
        return receptionsById.value.get(idValueOf(id)) ?? null;
    }

    function batchById(id) {
        return batchesById.value.get(idValueOf(id)) ?? null;
    }

    function productionRecordById(id) {
        return productionRecords.value.find(record => record.id.value === idValueOf(id)) ?? null;
    }

    /** @param {import('../domain/model/batch-code.js').BatchCode} code */
    function isBatchCodeTaken(code) {
        return batches.value.some(batch => batch.code.equals(code));
    }

    async function fetchReceptions() {
        clearErrors('fetch-receptions');
        try {
            const response = await productionApi.getReceptions();
            receptions.value = RawMaterialReceptionAssembler.toEntitiesFromResponse(response);
            receptionsLoaded.value = true;
        } catch (error) {
            addErrors('fetch-receptions', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchBatches() {
        clearErrors('fetch-batches');
        try {
            const response = await productionApi.getBatches();
            batches.value = ProductionBatchAssembler.toEntitiesFromResponse(response);
            batchesLoaded.value = true;
        } catch (error) {
            addErrors('fetch-batches', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchProductionRecords() {
        clearErrors('fetch-production-records');
        try {
            const response = await productionApi.getProductionRecords();
            productionRecords.value = ProductionRecordAssembler.toEntitiesFromResponse(response);
            recordsLoaded.value = true;
        } catch (error) {
            addErrors('fetch-production-records', ApiErrorHandler.toMessages(error));
        }
    }

    /** Loads whatever has not been loaded yet. */
    function fetchProductionData() {
        return Promise.all([
            receptionsLoaded.value ? null : fetchReceptions(),
            batchesLoaded.value ? null : fetchBatches(),
            recordsLoaded.value ? null : fetchProductionRecords(),
        ]);
    }

    /**
     * @param {import('../domain/model/raw-material-reception.entity.js').RawMaterialReception} reception
     * @returns {Promise<import('../domain/model/raw-material-reception.entity.js').RawMaterialReception|null>}
     *          the registered reception, or null when it could not be registered.
     */
    async function registerReception(reception) {
        clearErrors('register-reception');
        try {
            const response = await productionApi.createReception(RawMaterialReceptionAssembler.toResourceFromEntity(reception));
            const registeredReception = RawMaterialReceptionAssembler.toEntityFromResource(response.data);
            receptions.value = [...receptions.value, registeredReception];
            return registeredReception;
        } catch (error) {
            addErrors('register-reception', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /**
     * Registers a batch for an existing reception, rejecting a code that another batch already uses.
     * @param {import('../domain/model/production-batch.entity.js').ProductionBatch} batch
     */
    async function registerBatch(batch) {
        clearErrors('register-batch');
        await fetchProductionData();
        if (!receptionById(batch.receptionId)) {
            addErrors('register-batch', ['production.errors.unknown-reception']);
            return null;
        }
        if (isBatchCodeTaken(batch.code)) {
            addErrors('register-batch', ['production.errors.duplicate-batch-code']);
            return null;
        }
        try {
            const response = await productionApi.createBatch(ProductionBatchAssembler.toResourceFromEntity(batch));
            const registeredBatch = ProductionBatchAssembler.toEntityFromResource(response.data);
            batches.value = [...batches.value, registeredBatch];
            return registeredBatch;
        } catch (error) {
            addErrors('register-batch', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /** @param {import('../domain/model/production-record.entity.js').ProductionRecord} record */
    async function registerProductionRecord(record) {
        clearErrors('register-production-record');
        await fetchProductionData();
        if (!batchById(record.batchId)) {
            addErrors('register-production-record', ['production.errors.unknown-batch']);
            return null;
        }
        try {
            const response = await productionApi.createProductionRecord(ProductionRecordAssembler.toResourceFromEntity(record));
            const registeredRecord = ProductionRecordAssembler.toEntityFromResource(response.data);
            productionRecords.value = [...productionRecords.value, registeredRecord];
            return registeredRecord;
        } catch (error) {
            addErrors('register-production-record', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /** @param {import('../domain/model/production-record.entity.js').ProductionRecord} record */
    async function updateProductionRecord(record) {
        clearErrors('update-production-record');
        await fetchProductionData();
        if (!productionRecordById(record.id)) {
            addErrors('update-production-record', ['production.errors.record-not-found']);
            return null;
        }
        try {
            const response = await productionApi.updateProductionRecord(ProductionRecordAssembler.toResourceFromEntity(record));
            const updatedRecord = ProductionRecordAssembler.toEntityFromResource(response.data);
            productionRecords.value = productionRecords.value.map(current =>
                current.id.equals(updatedRecord.id) ? updatedRecord : current);
            return updatedRecord;
        } catch (error) {
            addErrors('update-production-record', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    return {
        receptions,
        batches,
        productionRecords,
        errors,
        receptionsLoaded,
        batchesLoaded,
        recordsLoaded,
        receptionsCount,
        batchesCount,
        productionRecordsCount,
        recordsByBatchId,
        clearErrors,
        hasErrors,
        receptionById,
        batchById,
        productionRecordById,
        isBatchCodeTaken,
        fetchReceptions,
        fetchBatches,
        fetchProductionRecords,
        fetchProductionData,
        registerReception,
        registerBatch,
        registerProductionRecord,
        updateProductionRecord,
    };
});

export default useProductionStore;
