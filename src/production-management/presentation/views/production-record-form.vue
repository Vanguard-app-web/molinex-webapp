<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {ProductionRecord} from "../../domain/model/production-record.entity.js";
import {ProductionBatchId} from "../../domain/model/production-batch-id.js";
import {ProductionDetails} from "../../domain/model/production-details.js";
import {ProductionProcessName} from "../../domain/model/production-process-name.js";
import {ProductionPeriod} from "../../domain/model/production-period.js";
import {ProductionStatus, productionStatuses} from "../../domain/model/production-status.js";
import {Weight} from "../../../production-quality-shared-kernel/domain/model/weight.js";
import {MeasurementUnit, measurementUnits} from "../../../production-quality-shared-kernel/domain/model/measurement-unit.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t, locale} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useProductionStore();
const {batches, errors, batchesLoaded, recordsLoaded} = storeToRefs(store);
const {fetchProductionData, registerProductionRecord, updateProductionRecord, productionRecordById, batchById, clearErrors} = store;
const {required, requiredText, positiveNumber} = useFormValidation();

const editing = computed(() => Boolean(route.params.id));
const operation = computed(() => (editing.value ? 'update-production-record' : 'register-production-record'));
const existingRecord = computed(() => (editing.value ? productionRecordById(route.params.id) : null));
const recordNotFound = computed(() => editing.value && recordsLoaded.value && !existingRecord.value);

const form = reactive({
  batchId: null, processName: '', processedWeight: null, unit: MeasurementUnit.KILOGRAM,
  startedAt: new Date(), finishedAt: null, status: ProductionStatus.REGISTERED,
});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === operation.value));

const batchOptions = computed(() => batches.value.map(batch => ({value: batch.id.value, label: batch.code.value})));
const unitOptions = computed(() => measurementUnits.map(unit => ({value: unit, label: t(`unit-names.${unit}`)})));
const statusOptions = computed(() => productionStatuses.map(status => ({value: status, label: t(`production-status.${status}`)})));

const finishError = () => {
  if (!form.finishedAt || !form.startedAt) return '';
  return form.finishedAt.getTime() < form.startedAt.getTime() ? t('production-record-form.errors.finish-before-start') : '';
};
const fieldErrors = computed(() => ({
  batchId: required(form.batchId),
  processName: requiredText(form.processName, ProductionProcessName.MAX_LENGTH),
  processedWeight: positiveNumber(form.processedWeight),
  startedAt: required(form.startedAt),
  finishedAt: finishError(),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(async () => {
  clearErrors(operation.value);
  await fetchProductionData();
  const record = existingRecord.value;
  if (record) {
    Object.assign(form, {
      batchId: record.batchId.value,
      processName: record.details.processName.value,
      processedWeight: record.details.processedWeight.value,
      unit: record.details.processedWeight.unit,
      startedAt: record.details.period.startedAt,
      finishedAt: record.details.period.finishedAt,
      status: record.details.status,
    });
  } else if (!editing.value && route.query.batchId && batchById(route.query.batchId)) {
    form.batchId = String(route.query.batchId);
  }
});

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const details = new ProductionDetails({
    processName: new ProductionProcessName(form.processName),
    processedWeight: new Weight(form.processedWeight, form.unit),
    period: new ProductionPeriod(form.startedAt, form.finishedAt),
    status: form.status,
  });
  saving.value = true;
  const saved = editing.value
      ? await updateProductionRecord(existingRecord.value.updateDetails(details))
      : await registerProductionRecord(ProductionRecord.record({batchId: new ProductionBatchId(form.batchId), details}));
  saving.value = false;
  if (!saved) return;
  toast.add({
    severity: 'success',
    summary: t(editing.value ? 'production-record-form.updated' : 'production-record-form.saved', {process: saved.details.processName.value}),
    life: 4000,
  });
  await router.push({name: 'production-records', query: {batchId: saved.batchId.value}});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('production-records.eyebrow')"
                 :title="t(editing ? 'production-record-form.edit-title' : 'production-record-form.new-title')"
                 :description="t(editing ? 'production-record-form.edit-description' : 'production-record-form.description')"/>

    <section v-if="recordNotFound" class="panel">
      <empty-state icon="pi pi-search" :message="t('production.errors.record-not-found')">
        <link-button :to="{name: 'production-records'}" :label="t('common.back')" icon="pi pi-arrow-left" outlined/>
      </empty-state>
    </section>

    <form v-else class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="batchesLoaded && batches.length === 0" severity="info" class="mb-4">
        {{ t('production-record-form.no-batches') }}
        <router-link :to="{name: 'production-batch-new'}">{{ t('batches.new') }}</router-link>
      </pv-message>
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="record-batch" :label="t('production-record-form.batch')" :error="errorOf('batchId')"
                    :hint="editing ? t('production-record-form.batch-locked') : ''" required wide>
          <template #default="{invalid, labelId}">
            <pv-select v-model="form.batchId" :options="batchOptions" option-label="label" option-value="value" filter
                       :placeholder="t('production-record-form.batch-placeholder')" fluid :invalid="invalid"
                       :disabled="editing" :aria-labelledby="labelId" :loading="!batchesLoaded"/>
          </template>
        </form-field>
        <form-field id="record-process" :label="t('production-record-form.process-name')" :error="errorOf('processName')"
                    :hint="t('production-record-form.process-hint')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="record-process" v-model="form.processName" :maxlength="ProductionProcessName.MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="record-weight" :label="t('production-record-form.processed-weight')" :error="errorOf('processedWeight')" required>
          <template #default="{invalid}">
            <pv-input-number v-model="form.processedWeight" input-id="record-weight" :min="0" :max-fraction-digits="2"
                             :locale="locale" fluid :invalid="invalid" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="record-unit" :label="t('forms.unit')" required>
          <template #default="{labelId}">
            <pv-select v-model="form.unit" :options="unitOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
        <form-field id="record-started-at" :label="t('production-record-form.started-at')" :error="errorOf('startedAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.startedAt" input-id="record-started-at" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :invalid="invalid"/>
          </template>
        </form-field>
        <form-field id="record-finished-at" :label="t('production-record-form.finished-at')" :error="errorOf('finishedAt')"
                    :hint="t('production-record-form.finished-hint')">
          <template #default="{invalid}">
            <pv-date-picker v-model="form.finishedAt" input-id="record-finished-at" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" show-clear fluid :invalid="invalid" :min-date="form.startedAt"/>
          </template>
        </form-field>
        <form-field id="record-status" :label="t('production-record-form.status')" required>
          <template #default="{labelId}">
            <pv-select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'production-records'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t(editing ? 'production-record-form.update' : 'production-record-form.save')"
                   icon="pi pi-check" :loading="saving" :disabled="batchesLoaded && batches.length === 0"/>
      </div>
    </form>
  </section>
</template>
