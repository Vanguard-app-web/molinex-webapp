<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useQualityStore from "../../application/quality.store.js";
import {WasteRecord} from "../../domain/model/waste-record.entity.js";
import {ProductionRecordId} from "../../domain/model/production-record-id.js";
import {Weight} from "../../../shared/domain/model/weight.js";
import {MeasurementUnit, measurementUnits} from "../../../shared/domain/model/measurement-unit.js";
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
const {fetchQualityData, recordWaste, productionRecordById, productionBatchById, clearErrors} = store;
const {required, positiveNumber} = useFormValidation();
const {formatDateTime, formatWeight, formatPercentage} = useFormatters();

const form = reactive({productionRecordId: null, quantity: null, unit: MeasurementUnit.KILOGRAM, recordedAt: new Date()});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'record-waste'));
const unitOptions = computed(() => measurementUnits.map(unit => ({value: unit, label: t(`unit-names.${unit}`)})));
const selectedProcess = computed(() => (form.productionRecordId ? productionRecordById(form.productionRecordId) : null));
const wasteWeight = computed(() => (form.quantity > 0 ? new Weight(form.quantity, form.unit) : null));
const exceedsProcessedWeight = computed(() =>
    Boolean(wasteWeight.value && selectedProcess.value && wasteWeight.value.exceeds(selectedProcess.value.processedWeight)));
const previewPercentage = computed(() => {
  if (!wasteWeight.value || !selectedProcess.value || exceedsProcessedWeight.value) return null;
  return (wasteWeight.value.toKilograms() / selectedProcess.value.processedWeight.toKilograms()) * 100;
});

const fieldErrors = computed(() => ({
  productionRecordId: required(form.productionRecordId),
  quantity: positiveNumber(form.quantity) || (exceedsProcessedWeight.value ? t('waste-record-form.errors.exceeds') : ''),
  recordedAt: required(form.recordedAt),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(async () => {
  clearErrors('record-waste');
  await fetchQualityData();
  const requested = route.query.productionRecordId;
  if (requested && productionRecordById(requested)) form.productionRecordId = String(requested);
});

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const waste = WasteRecord.record({
    productionRecordId: new ProductionRecordId(form.productionRecordId),
    quantity: new Weight(form.quantity, form.unit),
    baseWeight: selectedProcess.value.processedWeight,
    recordedAt: form.recordedAt,
  });
  saving.value = true;
  const recorded = await recordWaste(waste);
  saving.value = false;
  if (!recorded) return;
  toast.add({severity: 'success', summary: t('waste-record-form.saved', {percentage: formatPercentage(recorded.percentage?.value)}), life: 4000});
  await router.push({name: 'quality-waste'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('waste-records.eyebrow')" :title="t('waste-record-form.title')" :description="t('waste-record-form.description')"/>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="referencesLoaded && productionRecords.length === 0" severity="info" class="mb-4">
        {{ t('quality.no-processes') }}
        <router-link :to="{name: 'production-record-new'}">{{ t('production-records.new') }}</router-link>
      </pv-message>
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="waste-process" :label="t('quality.process')" :error="errorOf('productionRecordId')" required wide>
          <template #default="{invalid, labelId}">
            <production-process-select v-model="form.productionRecordId" :processes="productionRecords"
                                       :batch-of="productionBatchById" :label-id="labelId" :invalid="invalid"
                                       :loading="!referencesLoaded"/>
          </template>
        </form-field>
        <div v-if="selectedProcess" class="context-card span-2">
          <i class="pi pi-cog" aria-hidden="true"></i>
          <div>
            <strong>{{ t('waste-record-form.processed-weight', {weight: formatWeight(selectedProcess.processedWeight)}) }}</strong>
            <small>{{ selectedProcess.processName }} · {{ productionBatchById(selectedProcess.batchId)?.code ?? `#${selectedProcess.batchId}` }}
              · {{ formatDateTime(selectedProcess.startedAt) }}</small>
          </div>
        </div>
        <form-field id="waste-quantity" :label="t('waste-record-form.quantity')" :error="errorOf('quantity')" required>
          <template #default="{invalid}">
            <pv-input-number v-model="form.quantity" input-id="waste-quantity" :min="0" :max-fraction-digits="2"
                             :locale="locale" fluid :invalid="invalid" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="waste-unit" :label="t('forms.unit')" required>
          <template #default="{labelId}">
            <pv-select v-model="form.unit" :options="unitOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
        <div class="percentage-preview span-2" aria-live="polite">
          <span>{{ t('waste-record-form.calculated-percentage') }}</span>
          <strong>{{ formatPercentage(previewPercentage) }}</strong>
          <small>{{ t('waste-record-form.percentage-help') }}</small>
        </div>
        <form-field id="waste-recorded-at" :label="t('waste-record-form.recorded-at')" :error="errorOf('recordedAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.recordedAt" input-id="waste-recorded-at" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :invalid="invalid"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'quality-waste'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('waste-record-form.save')" icon="pi pi-check" :loading="saving"
                   :disabled="referencesLoaded && productionRecords.length === 0"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.percentage-preview {
  display: grid;
  gap: 0.15rem;
  padding: var(--molinex-space-m);
  border-radius: var(--molinex-radius);
  border: 1px dashed var(--molinex-gold-dark);
  background: var(--molinex-warning-background);
}

.percentage-preview strong {
  font-family: var(--molinex-font-heading);
  font-size: 1.5rem;
}

.percentage-preview small {
  color: var(--molinex-text-secondary);
}
</style>
