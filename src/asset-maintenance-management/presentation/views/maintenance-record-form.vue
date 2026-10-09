<script setup>
import {computed, onMounted, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useMaintenanceStore from "../../application/maintenance.store.js";
import {MaintenanceRecord} from "../../domain/model/maintenance-record.entity.js";
import {MaintenanceType} from "../../domain/model/maintenance-type.js";
import {MachineId} from "../../domain/model/machine-id.js";
import {MaintenanceDateTime} from "../../domain/model/maintenance-date-time.js";
import {MaintenanceDescription} from "../../domain/model/maintenance-description.js";
import {TechnicianReference} from "../../domain/model/technician-reference.js";
import {AnomalyReference} from "../../domain/model/anomaly-reference.js";
import {CorrectiveMaintenanceDetails} from "../../domain/model/corrective-maintenance-details.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import MachineStatusTag from "../components/machine-status-tag.vue";

const props = defineProps({
  /** A MaintenanceType: the route decides whether this form records preventive or corrective work. */
  type: {type: String, required: true}
});

const {t, locale} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useMaintenanceStore();
const {machines, errors, machinesLoaded} = storeToRefs(store);
const {fetchMaintenanceData, recordMaintenance, machineById, clearErrors} = store;
const {required, requiredText, optionalText, wholeNumber} = useFormValidation();

const corrective = computed(() => props.type === MaintenanceType.CORRECTIVE);
const form = reactive({
  machineId: null, performedAt: new Date(), responsible: '', description: '',
  failure: '', cause: '', actionTaken: '', downtimeMinutes: null, anomalyId: '',
});
const submitted = ref(false);
const saving = ref(false);
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'record-maintenance'));
const selectedMachine = computed(() => (form.machineId ? machineById(form.machineId) : null));
const machineOptions = computed(() => [...machines.value]
    .sort((first, second) => first.code.value.localeCompare(second.code.value))
    .map(machine => ({value: machine.id.value, label: `${machine.code.value} · ${machine.name.value}`})));

const fieldErrors = computed(() => (corrective.value
    ? {
      machineId: required(form.machineId),
      performedAt: required(form.performedAt),
      responsible: requiredText(form.responsible, TechnicianReference.MAX_LENGTH),
      failure: requiredText(form.failure, CorrectiveMaintenanceDetails.FAILURE_MAX_LENGTH),
      cause: requiredText(form.cause, CorrectiveMaintenanceDetails.CAUSE_MAX_LENGTH),
      actionTaken: requiredText(form.actionTaken, CorrectiveMaintenanceDetails.ACTION_MAX_LENGTH),
      downtimeMinutes: wholeNumber(form.downtimeMinutes),
      anomalyId: optionalText(form.anomalyId, AnomalyReference.MAX_LENGTH),
    }
    : {
      machineId: required(form.machineId),
      performedAt: required(form.performedAt),
      responsible: requiredText(form.responsible, TechnicianReference.MAX_LENGTH),
      description: requiredText(form.description, MaintenanceDescription.MAX_LENGTH),
    }));
const errorOf = field => (submitted.value ? fieldErrors.value[field] ?? '' : '');

onMounted(async () => {
  clearErrors('record-maintenance');
  await fetchMaintenanceData();
  const requested = route.query.machineId;
  if (requested && machineById(requested)) form.machineId = String(requested);
});

function buildRecord() {
  const common = {
    machineId: new MachineId(form.machineId),
    performedAt: new MaintenanceDateTime(form.performedAt),
    responsible: new TechnicianReference(form.responsible),
  };
  if (!corrective.value) {
    return MaintenanceRecord.recordPreventive({...common, description: new MaintenanceDescription(form.description)});
  }
  return MaintenanceRecord.recordCorrective({
    ...common,
    correctiveDetails: new CorrectiveMaintenanceDetails({
      failure: form.failure, cause: form.cause, actionTaken: form.actionTaken, downtimeMinutes: form.downtimeMinutes,
    }),
    anomalyReference: form.anomalyId.trim() ? new AnomalyReference(form.anomalyId) : null,
  });
}

async function save() {
  submitted.value = true;
  if (!hasNoErrors(fieldErrors.value)) return;
  saving.value = true;
  const recorded = await recordMaintenance(buildRecord());
  saving.value = false;
  if (!recorded) return;
  toast.add({severity: 'success', summary: t('maintenance-form.saved', {machine: selectedMachine.value?.name.value ?? ''}), life: 4000});
  await router.push({name: 'maintenance-history', query: {machineId: recorded.machineId.value}});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('maintenance-history.eyebrow')"
                 :title="t(corrective ? 'maintenance-form.corrective-title' : 'maintenance-form.preventive-title')"
                 :description="t(corrective ? 'maintenance-form.corrective-description' : 'maintenance-form.preventive-description')"/>

    <pv-message v-if="machinesLoaded && machines.length === 0" severity="info">
      {{ t('maintenance-form.no-machines') }}
      <router-link :to="{name: 'maintenance-machine-new'}">{{ t('machines.new') }}</router-link>
    </pv-message>

    <form class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="maintenance-machine" :label="t('maintenance-form.machine')" :error="errorOf('machineId')" required wide>
          <template #default="{invalid, labelId}">
            <pv-select v-model="form.machineId" :options="machineOptions" option-label="label" option-value="value" filter fluid
                       :placeholder="t('maintenance-form.machine-placeholder')" :invalid="invalid"
                       :aria-labelledby="labelId" :loading="!machinesLoaded"/>
          </template>
        </form-field>
        <div v-if="selectedMachine" class="context-card span-2">
          <i class="pi pi-server" aria-hidden="true"></i>
          <div>
            <strong>{{ selectedMachine.code.value }} · {{ selectedMachine.name.value }}</strong>
            <small>{{ selectedMachine.model.value }}</small>
          </div>
          <machine-status-tag :status="selectedMachine.status" class="ml-auto"/>
        </div>
        <form-field id="maintenance-date" :label="t('maintenance-form.performed-at')" :error="errorOf('performedAt')"
                    :hint="corrective ? '' : t('maintenance-form.performed-at-hint')" required>
          <template #default="{invalid}">
            <pv-date-picker v-model="form.performedAt" input-id="maintenance-date" show-time hour-format="24"
                            date-format="yy-mm-dd" show-icon :show-on-focus="false" fluid :invalid="invalid"/>
          </template>
        </form-field>
        <form-field id="maintenance-responsible" :label="t('maintenance-form.responsible')" :error="errorOf('responsible')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="maintenance-responsible" v-model="form.responsible" :maxlength="TechnicianReference.MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true" autocomplete="name"/>
          </template>
        </form-field>

        <template v-if="!corrective">
          <form-field id="maintenance-description" :label="t('maintenance-form.observations')" :error="errorOf('description')"
                      :hint="t('forms.characters', {count: form.description.length, max: MaintenanceDescription.MAX_LENGTH})" required wide>
            <template #default="{invalid, describedBy}">
              <pv-textarea id="maintenance-description" v-model="form.description" rows="4" :maxlength="MaintenanceDescription.MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
            </template>
          </form-field>
        </template>

        <template v-else>
          <form-field id="maintenance-failure" :label="t('maintenance-form.failure')" :error="errorOf('failure')" required wide>
            <template #default="{invalid, describedBy}">
              <pv-textarea id="maintenance-failure" v-model="form.failure" rows="2" :maxlength="CorrectiveMaintenanceDetails.FAILURE_MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
            </template>
          </form-field>
          <form-field id="maintenance-cause" :label="t('maintenance-form.cause')" :error="errorOf('cause')" required wide>
            <template #default="{invalid, describedBy}">
              <pv-textarea id="maintenance-cause" v-model="form.cause" rows="2" :maxlength="CorrectiveMaintenanceDetails.CAUSE_MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
            </template>
          </form-field>
          <form-field id="maintenance-action" :label="t('maintenance-form.action')" :error="errorOf('actionTaken')" required wide>
            <template #default="{invalid, describedBy}">
              <pv-textarea id="maintenance-action" v-model="form.actionTaken" rows="3" :maxlength="CorrectiveMaintenanceDetails.ACTION_MAX_LENGTH"
                           fluid :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
            </template>
          </form-field>
          <form-field id="maintenance-downtime" :label="t('maintenance-form.downtime')" :error="errorOf('downtimeMinutes')" required>
            <template #default="{invalid}">
              <pv-input-number v-model="form.downtimeMinutes" input-id="maintenance-downtime" :min="0" :max-fraction-digits="0"
                               :suffix="` ${t('units.minutes')}`" :locale="locale" fluid :invalid="invalid" aria-required="true"/>
            </template>
          </form-field>
          <form-field id="maintenance-anomaly" :label="t('maintenance-form.anomaly')" :error="errorOf('anomalyId')"
                      :hint="t('maintenance-form.anomaly-hint')">
            <template #default="{invalid, describedBy}">
              <pv-input-text id="maintenance-anomaly" v-model="form.anomalyId" :maxlength="AnomalyReference.MAX_LENGTH"
                             fluid :invalid="invalid" :aria-describedby="describedBy"/>
            </template>
          </form-field>
        </template>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'maintenance-history'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t(corrective ? 'maintenance-form.save-corrective' : 'maintenance-form.save-preventive')"
                   icon="pi pi-check" :loading="saving" :disabled="machinesLoaded && machines.length === 0"/>
      </div>
    </form>
  </section>
</template>
