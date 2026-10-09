<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {RawMaterialReception} from "../../domain/model/raw-material-reception.entity.js";
import {ReceptionDateTime} from "../../domain/model/reception-date-time.js";
import {Supplier} from "../../domain/model/supplier.js";
import {MaterialOrigin} from "../../domain/model/material-origin.js";
import {Weight} from "../../../production-quality-shared-kernel/domain/model/weight.js";
import {MeasurementUnit, measurementUnits} from "../../../production-quality-shared-kernel/domain/model/measurement-unit.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";

const {t, locale} = useI18n();
const router = useRouter();
const toast = useToast();
const store = useProductionStore();
const {errors} = storeToRefs(store);
const {registerReception, clearErrors} = store;
const {requiredText, positiveNumber, notInFuture} = useFormValidation();

const form = reactive({receivedAt: new Date(), supplier: '', origin: '', quantity: null, unit: MeasurementUnit.KILOGRAM});
const submitted = ref(false);
const saving = ref(false);
const unitOptions = computed(() => measurementUnits.map(unit => ({value: unit, label: t(`unit-names.${unit}`)})));
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'register-reception'));

const fieldErrors = computed(() => ({
  receivedAt: notInFuture(form.receivedAt),
  supplier: requiredText(form.supplier, Supplier.MAX_LENGTH),
  origin: requiredText(form.origin, MaterialOrigin.MAX_LENGTH),
  quantity: positiveNumber(form.quantity),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(() => clearErrors('register-reception'));

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const reception = RawMaterialReception.record({
    receivedAt: new ReceptionDateTime(form.receivedAt),
    supplier: new Supplier(form.supplier),
    origin: new MaterialOrigin(form.origin),
    quantity: new Weight(form.quantity, form.unit),
  });
  saving.value = true;
  const registered = await registerReception(reception);
  saving.value = false;
  if (!registered) return;
  toast.add({severity: 'success', summary: t('reception-form.saved', {id: registered.id.value}), life: 4000});
  await router.push({name: 'production-receptions'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('receptions.eyebrow')" :title="t('reception-form.title')" :description="t('reception-form.description')"/>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="reception-received-at" :label="t('reception-form.received-at')" :error="errorOf('receivedAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.receivedAt" input-id="reception-received-at" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :max-date="new Date()" :invalid="invalid"/>
          </template>
        </form-field>
        <form-field id="reception-supplier" :label="t('reception-form.supplier')" :error="errorOf('supplier')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="reception-supplier" v-model="form.supplier" :maxlength="Supplier.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true" autocomplete="organization"/>
          </template>
        </form-field>
        <form-field id="reception-origin" :label="t('reception-form.origin')" :error="errorOf('origin')"
                    :hint="t('reception-form.origin-hint')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="reception-origin" v-model="form.origin" :maxlength="MaterialOrigin.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="reception-quantity" :label="t('reception-form.quantity')" :error="errorOf('quantity')" required>
          <template #default="{invalid}">
            <pv-input-number v-model="form.quantity" input-id="reception-quantity" :min="0" :max-fraction-digits="2"
                             :locale="locale" fluid :invalid="invalid" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="reception-unit" :label="t('forms.unit')" required>
          <template #default="{labelId}">
            <pv-select v-model="form.unit" :options="unitOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <pv-button :label="t('common.cancel')" severity="secondary" outlined @click="router.push({name: 'production-receptions'})"/>
        <pv-button type="submit" :label="t('reception-form.save')" icon="pi pi-check" :loading="saving"/>
      </div>
    </form>
  </section>
</template>
