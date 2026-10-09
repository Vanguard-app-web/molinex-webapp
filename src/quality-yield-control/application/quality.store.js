import {defineStore} from "pinia";
import {computed, ref, shallowRef} from "vue";
import {QualityApi} from "../infrastructure/quality-api.js";
import {QualityAssessmentAssembler} from "../infrastructure/assemblers/quality-assessment.assembler.js";
import {WasteRecordAssembler} from "../infrastructure/assemblers/waste-record.assembler.js";
import {ProductionReferenceAssembler} from "../infrastructure/assemblers/production-reference.assembler.js";
import {QualityIndicator} from "../domain/model/quality-indicator.js";
import {ApiErrorHandler} from "../../shared/infrastructure/api-error-handler.js";

const qualityApi = new QualityApi();

/** @param {{value: string}|string|null|undefined} id an identifier Value Object or its raw value. */
const idValueOf = id => (id === null || id === undefined ? null : String(id.value ?? id));

/**
 * Application state of Quality and Yield Control: quality assessments, waste records and the
 * production references they point to.
 */
const useQualityStore = defineStore('quality', () => {
    const assessments = shallowRef([]);
    const wasteRecords = shallowRef([]);
    const productionRecords = shallowRef([]);
    const productionBatches = shallowRef([]);
    /** @type {import('vue').Ref<{operation: string, message: string}[]>} */
    const errors = ref([]);
    const assessmentsLoaded = ref(false);
    const wasteRecordsLoaded = ref(false);
    const referencesLoaded = ref(false);

    const assessmentsCount = computed(() => assessments.value.length);
    const wasteRecordsCount = computed(() => wasteRecords.value.length);
    const productionRecordsById = computed(() => new Map(productionRecords.value.map(record => [record.id.value, record])));
    const productionBatchesById = computed(() => new Map(productionBatches.value.map(batch => [batch.id, batch])));
    const averageWholeGrain = computed(() => averageOf(QualityIndicator.WHOLE_GRAIN_PERCENTAGE));
    const averageBrokenGrain = computed(() => averageOf(QualityIndicator.BROKEN_GRAIN_PERCENTAGE));
    const averageYield = computed(() => averageOf(QualityIndicator.YIELD_PERCENTAGE));

    /** @returns {number|null} null when no assessment measured that indicator. */
    function averageOf(indicator) {
        const values = assessments.value
            .map(assessment => assessment.measurementValue(indicator))
            .filter(value => value !== null);
        return values.length === 0 ? null : values.reduce((total, value) => total + value, 0) / values.length;
    }

    function addErrors(operation, messages) {
        errors.value = [...errors.value, ...messages.map(message => ({operation, message}))];
    }

    function clearErrors(operation) {
        errors.value = operation ? errors.value.filter(error => error.operation !== operation) : [];
    }

    function hasErrors(operation) {
        return errors.value.some(error => error.operation === operation);
    }

    /** @returns {import('../domain/model/production-record-reference.js').ProductionRecordReference|null} */
    function productionRecordById(id) {
        return productionRecordsById.value.get(idValueOf(id)) ?? null;
    }

    /** @returns {import('../domain/model/production-batch-reference.js').ProductionBatchReference|null} */
    function productionBatchById(id) {
        return productionBatchesById.value.get(idValueOf(id)) ?? null;
    }

    async function fetchAssessments() {
        clearErrors('fetch-assessments');
        try {
            const response = await qualityApi.getAssessments();
            assessments.value = QualityAssessmentAssembler.toEntitiesFromResponse(response);
            assessmentsLoaded.value = true;
        } catch (error) {
            addErrors('fetch-assessments', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchWasteRecords() {
        clearErrors('fetch-waste-records');
        try {
            const response = await qualityApi.getWasteRecords();
            wasteRecords.value = WasteRecordAssembler.toEntitiesFromResponse(response);
            wasteRecordsLoaded.value = true;
        } catch (error) {
            addErrors('fetch-waste-records', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchProductionReferences() {
        clearErrors('fetch-production-references');
        try {
            const [recordsResponse, batchesResponse] = await Promise.all([
                qualityApi.getProductionRecordReferences(),
                qualityApi.getProductionBatchReferences(),
            ]);
            productionRecords.value = ProductionReferenceAssembler.toRecordModelsFromResponse(recordsResponse);
            productionBatches.value = ProductionReferenceAssembler.toBatchModelsFromResponse(batchesResponse);
            referencesLoaded.value = true;
        } catch (error) {
            addErrors('fetch-production-references', ApiErrorHandler.toMessages(error));
        }
    }

    /**
     * Loads whatever has not been loaded yet. Production references are always refreshed, because
     * Production Management may have registered new processes since the last visit.
     */
    function fetchQualityData() {
        return Promise.all([
            assessmentsLoaded.value ? null : fetchAssessments(),
            wasteRecordsLoaded.value ? null : fetchWasteRecords(),
            fetchProductionReferences(),
        ]);
    }

    /** @param {import('../domain/model/quality-assessment.entity.js').QualityAssessment} assessment */
    async function recordAssessment(assessment) {
        clearErrors('record-assessment');
        if (!referencesLoaded.value) await fetchProductionReferences();
        if (!productionRecordById(assessment.productionRecordId)) {
            addErrors('record-assessment', ['quality.errors.unknown-process']);
            return null;
        }
        try {
            const response = await qualityApi.createAssessment(QualityAssessmentAssembler.toResourceFromEntity(assessment));
            const recordedAssessment = QualityAssessmentAssembler.toEntityFromResource(response.data);
            assessments.value = [...assessments.value, recordedAssessment];
            return recordedAssessment;
        } catch (error) {
            addErrors('record-assessment', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    /** @param {import('../domain/model/waste-record.entity.js').WasteRecord} wasteRecord */
    async function recordWaste(wasteRecord) {
        clearErrors('record-waste');
        if (!referencesLoaded.value) await fetchProductionReferences();
        if (!productionRecordById(wasteRecord.productionRecordId)) {
            addErrors('record-waste', ['quality.errors.unknown-process']);
            return null;
        }
        try {
            const response = await qualityApi.createWasteRecord(WasteRecordAssembler.toResourceFromEntity(wasteRecord));
            const recordedWaste = WasteRecordAssembler.toEntityFromResource(response.data);
            wasteRecords.value = [...wasteRecords.value, recordedWaste];
            return recordedWaste;
        } catch (error) {
            addErrors('record-waste', ApiErrorHandler.toMessages(error));
            return null;
        }
    }

    return {
        assessments,
        wasteRecords,
        productionRecords,
        productionBatches,
        errors,
        assessmentsLoaded,
        wasteRecordsLoaded,
        referencesLoaded,
        assessmentsCount,
        wasteRecordsCount,
        averageWholeGrain,
        averageBrokenGrain,
        averageYield,
        clearErrors,
        hasErrors,
        productionRecordById,
        productionBatchById,
        fetchAssessments,
        fetchWasteRecords,
        fetchProductionReferences,
        fetchQualityData,
        recordAssessment,
        recordWaste,
    };
});

export default useQualityStore;
