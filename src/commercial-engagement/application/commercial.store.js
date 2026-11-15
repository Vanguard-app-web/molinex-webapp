import {defineStore} from "pinia";
import {ref, shallowRef} from "vue";
import {CommercialApi} from "../infrastructure/commercial-api.js";
import {PlanAssembler} from "../infrastructure/assemblers/plan.assembler.js";
import {ValuePropositionAssembler} from "../infrastructure/assemblers/value-proposition.assembler.js";
import {CommercialInquiryAssembler} from "../infrastructure/assemblers/commercial-inquiry.assembler.js";
import {ApiErrorHandler} from "../../shared/infrastructure/api-error-handler.js";

const commercialApi = new CommercialApi();

/**
 * Application state of Commercial Engagement: the plan catalog, the value proposition and the
 * inquiry a visitor sent. Everything here is public, so it needs no session.
 */
const useCommercialStore = defineStore('commercial', () => {
    const plans = shallowRef([]);
    const valueProposition = shallowRef(null);
    /** The last inquiry the API stored. It stays null until the API confirms. */
    const inquiry = shallowRef(null);
    const plansLoaded = ref(false);
    const valuePropositionLoaded = ref(false);
    const submitting = ref(false);
    /** @type {import('vue').Ref<{operation: string, message: string}[]>} */
    const errors = ref([]);

    function addErrors(operation, messages) {
        errors.value = [...errors.value, ...messages.map(message => ({operation, message}))];
    }

    function clearErrors(operation) {
        errors.value = operation ? errors.value.filter(error => error.operation !== operation) : [];
    }

    function hasErrors(operation) {
        return errors.value.some(error => error.operation === operation);
    }

    async function fetchPlans() {
        clearErrors('fetch-plans');
        try {
            const response = await commercialApi.getPlans();
            plans.value = PlanAssembler.toEntities(response);
            plansLoaded.value = true;
        } catch (error) {
            addErrors('fetch-plans', ApiErrorHandler.toMessages(error));
        }
    }

    async function fetchValueProposition() {
        clearErrors('fetch-value-proposition');
        try {
            const response = await commercialApi.getValueProposition();
            valueProposition.value = ValuePropositionAssembler.toEntity(response.data);
            valuePropositionLoaded.value = true;
        } catch (error) {
            addErrors('fetch-value-proposition', ApiErrorHandler.toMessages(error));
        }
    }

    /**
     * Sends a visitor's inquiry. `inquiry` only changes after the API stored it, so the interface
     * can never confirm something that was not persisted. Concurrent submissions are ignored.
     * @param {import('../domain/model/commercial-inquiry.entity.js').CommercialInquiry} draft
     * @returns {Promise<import('../domain/model/commercial-inquiry.entity.js').CommercialInquiry|null>}
     */
    async function submitInquiry(draft) {
        if (submitting.value) return null;
        clearErrors('submit-inquiry');
        submitting.value = true;
        try {
            const response = await commercialApi.createInquiry(CommercialInquiryAssembler.toResource(draft));
            const stored = CommercialInquiryAssembler.toEntity(response.data);
            if (!stored.isStored) throw new Error('The API did not assign an id to the inquiry.');
            inquiry.value = stored;
            return stored;
        } catch (error) {
            addErrors('submit-inquiry', ApiErrorHandler.toMessages(error));
            return null;
        } finally {
            submitting.value = false;
        }
    }

    /** Forgets the stored inquiry so the form can be used again. */
    function resetInquiry() {
        inquiry.value = null;
        clearErrors('submit-inquiry');
    }

    return {
        plans,
        valueProposition,
        inquiry,
        plansLoaded,
        valuePropositionLoaded,
        submitting,
        errors,
        clearErrors,
        hasErrors,
        fetchPlans,
        fetchValueProposition,
        submitInquiry,
        resetInquiry,
    };
});

export default useCommercialStore;
