<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useMaintenanceStore from "../../application/maintenance.store.js";
import {Machine} from "../../domain/model/machine.entity.js";
import {MachineCode} from "../../domain/model/machine-code.js";
import {MachineName} from "../../domain/model/machine-name.js";
import {MachineModel} from "../../domain/model/machine-model.js";
import {MachineStatus, machineStatuses} from "../../domain/model/machine-status.js";
import {StatusChangeDateTime} from "../../domain/model/status-change-date-time.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const router = useRouter();
const toast = useToast();
const store = useMaintenanceStore();
const {errors} = storeToRefs(store);
const {fetchMaintenanceData, registerMachine, isMachineCodeTaken, clearErrors} = store;
const {required, requiredText, notInFuture} = useFormValidation();

const form = reactive({code: '', name: '', model: '', status: MachineStatus.OPERATIONAL, statusChangedAt: new Date()});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'register-machine'));
const statusOptions = computed(() => machineStatuses.map(status => ({value: status, label: t(`machine-status.${status}`)})));

const codeError = () => {
  const textError = requiredText(form.code, MachineCode.MAX_LENGTH);
  if (textError) return textError;
  return isMachineCodeTaken(new MachineCode(form.code)) ? t('maintenance.errors.duplicate-machine-code') : '';
};
const fieldErrors = computed(() => ({
  code: codeError(),
  name: requiredText(form.name, MachineName.MAX_LENGTH),
  model: requiredText(form.model, MachineModel.MAX_LENGTH),
  status: required(form.status),
  statusChangedAt: notInFuture(form.statusChangedAt),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

onMounted(() => {
  clearErrors('register-machine');
  fetchMaintenanceData();
});

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  const machine = Machine.register({
    code: new MachineCode(form.code),
    name: new MachineName(form.name),
    model: new MachineModel(form.model),
    status: form.status,
    statusChangedAt: new StatusChangeDateTime(form.statusChangedAt),
  });
  saving.value = true;
  const registered = await registerMachine(machine);
  saving.value = false;
  if (!registered) return;
  toast.add({severity: 'success', summary: t('machine-form.saved', {code: registered.code.value}), life: 4000});
  await router.push({name: 'maintenance-machines'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('machines.eyebrow')" :title="t('machine-form.title')" :description="t('machine-form.description')"/>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="machine-code" :label="t('machine-form.code')" :error="errorOf('code')" :hint="t('machine-form.code-hint')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="machine-code" v-model="form.code" :maxlength="MachineCode.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="machine-name" :label="t('machine-form.name')" :error="errorOf('name')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="machine-name" v-model="form.name" :maxlength="MachineName.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="machine-model" :label="t('machine-form.model')" :error="errorOf('model')" :hint="t('machine-form.model-hint')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="machine-model" v-model="form.model" :maxlength="MachineModel.MAX_LENGTH" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="machine-status" :label="t('machine-form.status')" :error="errorOf('status')" required>
          <template #default="{invalid, labelId}">
            <pv-select v-model="form.status" :options="statusOptions" option-label="label" option-value="value" fluid
                       :invalid="invalid" :aria-labelledby="labelId"/>
          </template>
        </form-field>
        <form-field id="machine-status-date" :label="t('machine-form.status-changed-at')" :error="errorOf('statusChangedAt')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.statusChangedAt" input-id="machine-status-date" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :max-date="new Date()" :invalid="invalid"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'maintenance-machines'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('machine-form.save')" icon="pi pi-check" :loading="saving"/>
      </div>
    </form>
  </section>
</template>
