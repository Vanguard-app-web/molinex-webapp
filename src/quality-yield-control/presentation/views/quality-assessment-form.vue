<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useQualityStore from "../../application/quality.store.js";
import {QualityAssessment} from "../../domain/model/quality-assessment.entity.js";
import {QualityMeasurement} from "../../domain/model/quality-measurement.js";
import {QualityIndicator} from "../../domain/model/quality-indicator.js";
import {QualityRange} from "../../domain/model/quality-range.js";
import {Percentage} from "../../domain/model/percentage.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {AssessmentDateTime} from "../../domain/model/assessment-date-time.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import ProductionProcessSelect from "../components/production-process-select.vue";

const {t, locale} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useQualityStore();
const {productionRecords, errors, referencesLoaded} = storeToRefs(store);
const {fetchQualityData, recordAssessment, productionRecordById, productionBatchById, clearErrors} = store;
const {required, percentage} = useFormValidation();
const {formatDateTime, formatWeight} = useFormatters();

const form = reactive({productionRecordId: null, wholeGrain: null, brokenGrain: null, yieldValue: null, assessedAt: new Date()});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'record-assessment'));
const selectedProcess = computed(() => (form.productionRecordId ? productionRecordById(form.productionRecordId) : null));

const compositionError = () => {
  if (percentage(form.brokenGrain) || percentage(form.wholeGrain)) return percentage(form.brokenGrain);
  return form.wholeGrain + form.brokenGrain > Percentage.MAXIMUM ? t('quality-assessment-form.errors.composition') : '';
};
const fieldErrors = computed(() => ({
  productionRecordId: required(form.productionRecordId),
  wholeGrain: percentage(form.wholeGrain),
  brokenGrain: compositionError(),
  yieldValue: percentage(form.yieldValue),
  assessedAt: required(form.assessedAt),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(async () => {
  clearErrors('record-assessment');
  await fetchQualityData();
  const requested = route.query.productionRecordId;
  if (requested && productionRecordById(requested)) form.productionRecordId = String(requested);
});

const measurement = (indicator, value) => new QualityMeasurement(indicator, new Percentage(value), QualityRange.fullScale());

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const assessment = QualityAssessment.record({
    productionRecordId: new ProductionRecordId(form.productionRecordId),
    measurements: [
      measurement(QualityIndicator.WHOLE_GRAIN_PERCENTAGE, form.wholeGrain),
      measurement(QualityIndicator.BROKEN_GRAIN_PERCENTAGE, form.brokenGrain),
      measurement(QualityIndicator.YIELD_PERCENTAGE, form.yieldValue),
    ],
    assessedAt: new AssessmentDateTime(form.assessedAt),
  });
  saving.value = true;
  const recorded = await recordAssessment(assessment);
  saving.value = false;
  if (!recorded) return;
  toast.add({severity: 'success', summary: t('quality-assessment-form.saved'), life: 4000});
  await router.push({name: 'quality-assessments'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('quality-assessments.eyebrow')" :title="t('quality-assessment-form.title')"
                 :description="t('quality-assessment-form.description')"/>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="referencesLoaded && productionRecords.length === 0" severity="info" class="mb-4">
        {{ t('quality.no-processes') }}
        <router-link :to="{name: 'production-record-new'}">{{ t('production-records.new') }}</router-link>
      </pv-message>
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="assessment-process" :label="t('quality.process')" :error="errorOf('productionRecordId')" required wide>
          <template #default="{invalid, labelId}">
            <production-process-select v-model="form.productionRecordId" :processes="productionRecords"
                                       :batch-of="productionBatchById" :label-id="labelId" :invalid="invalid"
                                       :loading="!referencesLoaded"/>
          </template>
        </form-field>
        <div v-if="selectedProcess" class="context-card span-2">
          <i class="pi pi-cog" aria-hidden="true"></i>
          <div>
            <strong>{{ selectedProcess.processName }}</strong>
            <small>{{ productionBatchById(selectedProcess.batchId)?.code ?? `#${selectedProcess.batchId}` }}
              · {{ formatWeight(selectedProcess.processedWeight) }} · {{ formatDateTime(selectedProcess.startedAt) }}</small>
          </div>
        </div>

        <fieldset class="measurements span-2">
          <legend>{{ t('quality-assessment-form.measurements') }}</legend>
          <p class="secondary-text">{{ t('quality-assessment-form.measurements-help') }}</p>
          <div class="measurement-grid">
            <form-field id="assessment-whole" :label="t('quality-indicator.WHOLE_GRAIN_PERCENTAGE')" :error="errorOf('wholeGrain')" required>
              <template #default="{invalid}">
                <pv-input-number v-model="form.wholeGrain" input-id="assessment-whole" :min="0" :max="100"
                                 :max-fraction-digits="2" suffix=" %" :locale="locale" fluid :invalid="invalid" aria-required="true"/>
              </template>
            </form-field>
            <form-field id="assessment-broken" :label="t('quality-indicator.BROKEN_GRAIN_PERCENTAGE')" :error="errorOf('brokenGrain')" required>
              <template #default="{invalid}">
                <pv-input-number v-model="form.brokenGrain" input-id="assessment-broken" :min="0" :max="100"
                                 :max-fraction-digits="2" suffix=" %" :locale="locale" fluid :invalid="invalid" aria-required="true"/>
              </template>
            </form-field>
            <form-field id="assessment-yield" :label="t('quality-indicator.YIELD_PERCENTAGE')" :error="errorOf('yieldValue')" required>
              <template #default="{invalid}">
                <pv-input-number v-model="form.yieldValue" input-id="assessment-yield" :min="0" :max="100"
                                 :max-fraction-digits="2" suffix=" %" :locale="locale" fluid :invalid="invalid" aria-required="true"/>
              </template>
            </form-field>
          </div>
        </fieldset>

        <form-field id="assessment-date" :label="t('quality-assessment-form.assessed-at')" :error="errorOf('assessedAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.assessedAt" input-id="assessment-date" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :invalid="invalid"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'quality-assessments'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('quality-assessment-form.save')" icon="pi pi-check" :loading="saving"
                   :disabled="referencesLoaded && productionRecords.length === 0"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.measurements {
  border: 1px solid var(--molinex-border);
  border-radius: var(--molinex-radius);
  padding: var(--molinex-space-m);
  margin: 0;
  display: grid;
  gap: var(--molinex-space-s);
}

legend {
  font-family: var(--molinex-font-heading);
  font-weight: 600;
  padding: 0 var(--molinex-space-xs);
}

.measurement-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: var(--molinex-space-m);
}
</style>
