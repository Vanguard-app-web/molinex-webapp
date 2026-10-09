<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import useMaintenanceStore from "../../application/maintenance.store.js";
import {MaintenanceType, maintenanceTypes} from "../../domain/model/maintenance-type.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import MaintenanceTypeTag from "../components/maintenance-type-tag.vue";

const {t, n} = useI18n();
const route = useRoute();
const router = useRouter();
const {formatDateTime} = useFormatters();
const store = useMaintenanceStore();
const {machines, maintenanceRecords, errors, historyLoaded} = storeToRefs(store);
const {fetchMaintenanceData, machineById} = store;

const machineFilter = ref(route.query.machineId ? String(route.query.machineId) : null);
const typeFilter = ref(null);

onMounted(() => fetchMaintenanceData());

/** Keeps the machine filter in the address, so the machine cards can link to their own history. */
watch(machineFilter, machineId => router.replace({query: machineId ? {machineId} : {}}));
watch(() => route.query.machineId, machineId => machineFilter.value = machineId ? String(machineId) : null);

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const selectedMachine = computed(() => (machineFilter.value ? machineById(machineFilter.value) : null));
const machineOptions = computed(() => [...machines.value]
    .sort((first, second) => first.code.value.localeCompare(second.code.value))
    .map(machine => ({value: machine.id.value, label: `${machine.code.value} · ${machine.name.value}`})));
const typeOptions = computed(() => [
  {value: null, label: t('maintenance-history.all-types')},
  ...maintenanceTypes.map(type => ({value: type, label: t(`maintenance-type.${type}`)})),
]);

const records = computed(() => maintenanceRecords.value
    .filter(record => !machineFilter.value || record.machineId.value === machineFilter.value)
    .filter(record => !typeFilter.value || record.type === typeFilter.value)
    .sort((first, second) => second.performedAt.value - first.performedAt.value));

const preventiveCount = computed(() => records.value.filter(record => record.type === MaintenanceType.PREVENTIVE).length);
const correctiveCount = computed(() => records.value.filter(record => record.type === MaintenanceType.CORRECTIVE).length);
const downtimeMinutes = computed(() => records.value.reduce((total, record) => total + (record.correctiveDetails?.downtimeMinutes ?? 0), 0));

const newRecordQuery = computed(() => (machineFilter.value ? {machineId: machineFilter.value} : {}));
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('maintenance-history.eyebrow')" :title="t('maintenance-history.title')"
                 :description="t('maintenance-history.description')">
      <template #actions>
        <link-button :to="{name: 'maintenance-machines'}" :label="t('machines.title')" icon="pi pi-server" outlined/>
        <link-button :to="{name: 'maintenance-preventive-new', query: newRecordQuery}" :label="t('maintenance-history.new-preventive')"
                     icon="pi pi-calendar-plus"/>
        <link-button :to="{name: 'maintenance-corrective-new', query: newRecordQuery}" :label="t('maintenance-history.new-corrective')"
                     icon="pi pi-wrench" severity="danger"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchMaintenanceData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-calendar" :label="t('maintenance-history.metrics.preventive')" :value="preventiveCount"/>
      <metric-card icon="pi pi-wrench" tone="critical" :label="t('maintenance-history.metrics.corrective')" :value="correctiveCount"/>
      <metric-card icon="pi pi-stopwatch" tone="gold" :label="t('maintenance-history.metrics.downtime')"
                   :value="`${n(downtimeMinutes, 'integer')} ${t('units.minutes')}`"/>
    </div>

    <section class="panel" aria-labelledby="maintenance-history-title">
      <div class="panel-heading">
        <div>
          <h2 id="maintenance-history-title">
            {{ selectedMachine ? t('maintenance-history.machine-title', {machine: selectedMachine.name.value}) : t('maintenance-history.all-title') }}
          </h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: records.length}) }}</p>
        </div>
      </div>
      <div class="filters-bar">
        <div>
          <label id="maintenance-machine-filter">{{ t('filters.machine') }}</label>
          <pv-select v-model="machineFilter" :options="machineOptions" option-label="label" option-value="value" filter show-clear
                     :placeholder="t('filters.all-machines')" fluid aria-labelledby="maintenance-machine-filter"/>
        </div>
        <div>
          <span id="maintenance-type-filter" class="field-label">{{ t('filters.type') }}</span>
          <pv-select-button v-model="typeFilter" :options="typeOptions" option-label="label" option-value="value"
                            aria-labelledby="maintenance-type-filter"/>
        </div>
      </div>

      <div v-if="!historyLoaded && loadErrors.length === 0" role="status" class="secondary-text">{{ t('common.loading') }}</div>
      <empty-state v-else-if="records.length === 0" icon="pi pi-calendar-times"
                   :message="loadErrors.length ? t('common.unavailable') : selectedMachine ? t('maintenance-history.machine-empty') : t('maintenance-history.empty')"/>
      <ol v-else class="maintenance-timeline">
        <li v-for="record in records" :key="record.id.value"
            :class="['maintenance-card', {'maintenance-card--corrective': record.isCorrective()}]">
          <header>
            <div class="cell-stack">
              <small>{{ machineById(record.machineId)?.code.value ?? `#${record.machineId.value}` }}</small>
              <h3>{{ machineById(record.machineId)?.name.value ?? t('maintenance-history.unknown-machine') }}</h3>
            </div>
            <maintenance-type-tag :type="record.type"/>
          </header>
          <dl v-if="record.correctiveDetails" class="corrective-details">
            <div><dt>{{ t('maintenance-form.failure') }}</dt><dd>{{ record.correctiveDetails.failure }}</dd></div>
            <div><dt>{{ t('maintenance-form.cause') }}</dt><dd>{{ record.correctiveDetails.cause }}</dd></div>
            <div><dt>{{ t('maintenance-form.action') }}</dt><dd>{{ record.correctiveDetails.actionTaken }}</dd></div>
            <div><dt>{{ t('maintenance-form.downtime') }}</dt>
              <dd>{{ n(record.correctiveDetails.downtimeMinutes, 'integer') }} {{ t('units.minutes') }}</dd></div>
            <div v-if="record.anomalyReference"><dt>{{ t('maintenance-form.anomaly') }}</dt><dd>{{ record.anomalyReference.anomalyId }}</dd></div>
          </dl>
          <p v-else>{{ record.description.value }}</p>
          <footer>
            <span><i class="pi pi-calendar" aria-hidden="true"></i>
              <time :datetime="record.performedAt.value.toISOString()">{{ formatDateTime(record.performedAt.value) }}</time></span>
            <span><i class="pi pi-user" aria-hidden="true"></i>{{ record.responsible.displayName }}</span>
          </footer>
        </li>
      </ol>
    </section>
  </section>
</template>

<style scoped>
.maintenance-timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-m);
}

.maintenance-card {
  display: grid;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-m);
  border: 1px solid var(--molinex-border);
  border-left: 0.25rem solid var(--molinex-info);
  border-radius: var(--molinex-radius);
}

.maintenance-card--corrective {
  border-left-color: var(--molinex-critical);
}

.maintenance-card header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-s);
}

.maintenance-card h3 {
  font-size: 1rem;
}

.corrective-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: var(--molinex-space-s) var(--molinex-space-m);
  margin: 0;
}

dt {
  font-size: 0.8rem;
  color: var(--molinex-text-secondary);
}

dd {
  margin: 0;
}

footer {
  display: flex;
  flex-wrap: wrap;
  gap: var(--molinex-space-l);
  font-size: 0.85rem;
  color: var(--molinex-text-secondary);
}

footer span {
  display: inline-flex;
  align-items: center;
  gap: var(--molinex-space-s);
}
</style>
