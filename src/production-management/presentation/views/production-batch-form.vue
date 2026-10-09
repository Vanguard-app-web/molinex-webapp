<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {ProductionBatch} from "../../domain/model/production-batch.entity.js";
import {BatchCode} from "../../domain/model/batch-code.js";
import {RawMaterialReceptionId} from "../../domain/model/raw-material-reception-id.js";
import {BatchRegistrationDateTime} from "../../domain/model/batch-registration-date-time.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useProductionStore();
const {receptions, errors, receptionsLoaded} = storeToRefs(store);
const {fetchProductionData, registerBatch, receptionById, isBatchCodeTaken, clearErrors} = store;
const {required, requiredText} = useFormValidation();
const {formatDateTime, formatWeight} = useFormatters();

const form = reactive({code: '', receptionId: null, registeredAt: new Date()});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'register-batch'));

const receptionOptions = computed(() => [...receptions.value]
    .sort((first, second) => second.receivedAt.value - first.receivedAt.value)
    .map(reception => ({
      value: reception.id.value,
      label: `#${reception.id.value} · ${reception.supplier.name} · ${reception.origin.description}`,
    })));
const selectedReception = computed(() => (form.receptionId ? receptionById(form.receptionId) : null));

const codeError = () => {
  const textError = requiredText(form.code, BatchCode.MAX_LENGTH);
  if (textError) return textError;
  return isBatchCodeTaken(new BatchCode(form.code)) ? t('production.errors.duplicate-batch-code') : '';
};
const fieldErrors = computed(() => ({
  code: codeError(),
  receptionId: required(form.receptionId),
  registeredAt: required(form.registeredAt),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(async () => {
  clearErrors('register-batch');
  await fetchProductionData();
  const requested = route.query.receptionId;
  if (requested && receptionById(requested)) form.receptionId = String(requested);
});

watch(() => form.code, () => clearErrors('register-batch'));

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const batch = ProductionBatch.register({
    code: new BatchCode(form.code),
    receptionId: new RawMaterialReceptionId(form.receptionId),
    registeredAt: new BatchRegistrationDateTime(form.registeredAt),
  });
  saving.value = true;
  const registered = await registerBatch(batch);
  saving.value = false;
  if (!registered) return;
  toast.add({severity: 'success', summary: t('batch-form.saved', {code: registered.code.value}), life: 4000});
  await router.push({name: 'production-batches'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('batches.eyebrow')" :title="t('batch-form.title')" :description="t('batch-form.description')"/>

    <pv-message v-if="receptionsLoaded && receptions.length === 0" severity="info">
      {{ t('batch-form.no-receptions') }}
      <router-link :to="{name: 'production-reception-new'}">{{ t('receptions.new') }}</router-link>
    </pv-message>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="batch-code" :label="t('batch-form.code')" :error="errorOf('code')" :hint="t('batch-form.code-hint')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="batch-code" v-model="form.code" :maxlength="BatchCode.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="batch-registered-at" :label="t('batch-form.registered-at')" :error="errorOf('registeredAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.registeredAt" input-id="batch-registered-at" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :invalid="invalid"/>
          </template>
        </form-field>
        <form-field id="batch-reception" :label="t('batch-form.reception')" :error="errorOf('receptionId')" required wide>
          <template #default="{invalid, labelId}">
            <pv-select v-model="form.receptionId" :options="receptionOptions" option-label="label" option-value="value"
                       filter :placeholder="t('batch-form.reception-placeholder')" fluid :invalid="invalid"
                       :aria-labelledby="labelId" :loading="!receptionsLoaded"/>
          </template>
        </form-field>
        <div v-if="selectedReception" class="context-card span-2">
          <i class="pi pi-truck" aria-hidden="true"></i>
          <div>
            <strong>{{ selectedReception.supplier.name }}</strong>
            <small>{{ selectedReception.origin.description }} · {{ formatWeight(selectedReception.quantity) }}
              · {{ formatDateTime(selectedReception.receivedAt.value) }}</small>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'production-batches'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('batch-form.save')" icon="pi pi-check" :loading="saving"
                   :disabled="receptionsLoaded && receptions.length === 0"/>
      </div>
    </form>
  </section>
</template>
