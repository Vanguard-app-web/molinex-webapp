<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useMaintenanceStore from "../../application/maintenance.store.js";
import {MachineStatus} from "../../domain/model/machine-status.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import MachineStatusTag from "../components/machine-status-tag.vue";

const {t} = useI18n();
const {formatDateTime} = useFormatters();
const store = useMaintenanceStore();
const {machines, errors, machinesLoaded} = storeToRefs(store);
const {fetchMaintenanceData, countByStatus} = store;
const search = ref('');

onMounted(() => fetchMaintenanceData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const filteredMachines = computed(() => {
  const term = search.value.trim().toLowerCase();
  const sorted = [...machines.value].sort((first, second) => first.code.value.localeCompare(second.code.value));
  if (!term) return sorted;
  return sorted.filter(machine => [machine.code.value, machine.name.value, machine.model.value]
      .some(value => value.toLowerCase().includes(term)));
});
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('machines.eyebrow')" :title="t('machines.title')" :description="t('machines.description')">
      <template #actions>
        <link-button :to="{name: 'maintenance-history'}" :label="t('maintenance-history.title')" icon="pi pi-wrench" outlined/>
        <link-button :to="{name: 'maintenance-machine-new'}" :label="t('machines.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchMaintenanceData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-check-circle" tone="green" :label="t(`machine-status.${MachineStatus.OPERATIONAL}`)"
                   :value="countByStatus(MachineStatus.OPERATIONAL)"/>
      <metric-card icon="pi pi-exclamation-triangle" tone="gold" :label="t(`machine-status.${MachineStatus.REQUIRES_ATTENTION}`)"
                   :value="countByStatus(MachineStatus.REQUIRES_ATTENTION)"/>
      <metric-card icon="pi pi-wrench" :label="t(`machine-status.${MachineStatus.UNDER_MAINTENANCE}`)"
                   :value="countByStatus(MachineStatus.UNDER_MAINTENANCE)"/>
      <metric-card icon="pi pi-times-circle" tone="critical" :label="t(`machine-status.${MachineStatus.OUT_OF_SERVICE}`)"
                   :value="countByStatus(MachineStatus.OUT_OF_SERVICE)"/>
    </div>

    <section class="panel" aria-labelledby="machines-title">
      <div class="panel-heading">
        <div>
          <h2 id="machines-title">{{ t('machines.inventory') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: filteredMachines.length}) }}</p>
        </div>
        <pv-icon-field>
          <pv-input-icon class="pi pi-search"/>
          <pv-input-text v-model="search" type="search" :placeholder="t('machines.search')" :aria-label="t('machines.search')"/>
        </pv-icon-field>
      </div>

      <div v-if="!machinesLoaded && loadErrors.length === 0" role="status" class="secondary-text">{{ t('common.loading') }}</div>
      <empty-state v-else-if="filteredMachines.length === 0" icon="pi pi-server"
                   :message="loadErrors.length ? t('common.unavailable') : search ? t('common.no-results') : t('machines.empty')"/>
      <ul v-else class="machine-grid">
        <li v-for="machine in filteredMachines" :key="machine.id.value" class="machine-card">
          <header>
            <span class="machine-icon" aria-hidden="true"><i class="pi pi-server"></i></span>
            <div class="cell-stack">
              <small>{{ machine.code.value }}</small>
              <h3>{{ machine.name.value }}</h3>
            </div>
          </header>
          <machine-status-tag :status="machine.status"/>
          <dl>
            <div><dt>{{ t('machines.model') }}</dt><dd>{{ machine.model.value }}</dd></div>
            <div><dt>{{ t('machines.status-since') }}</dt><dd>{{ formatDateTime(machine.statusChangedAt.value) }}</dd></div>
          </dl>
          <div class="machine-actions">
            <link-button :to="{name: 'maintenance-history', query: {machineId: machine.id.value}}"
                         :label="t('machines.history')" icon="pi pi-history" text size="small"/>
            <link-button :to="{name: 'maintenance-preventive-new', query: {machineId: machine.id.value}}"
                         :label="t('machines.preventive')" icon="pi pi-calendar-plus" text size="small"/>
            <link-button :to="{name: 'maintenance-corrective-new', query: {machineId: machine.id.value}}"
                         :label="t('machines.corrective')" icon="pi pi-wrench" text size="small" severity="danger"/>
          </div>
        </li>
      </ul>
    </section>
  </section>
</template>

<style scoped>
.machine-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: var(--molinex-space-m);
}

.machine-card {
  display: grid;
  gap: var(--molinex-space-s);
  align-content: start;
  justify-items: start;
  padding: var(--molinex-space-m);
  border: 1px solid var(--molinex-border);
  border-radius: var(--molinex-radius);
}

.machine-card header {
  display: flex;
  gap: var(--molinex-space-m);
  align-items: center;
}

.machine-card h3 {
  font-size: 1rem;
}

.machine-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background: var(--molinex-blue-light);
  color: var(--molinex-blue);
}

dl {
  display: grid;
  gap: var(--molinex-space-xs);
  margin: 0;
  width: 100%;
}

dl div {
  display: flex;
  justify-content: space-between;
  gap: var(--molinex-space-s);
  font-size: 0.875rem;
}

dt {
  color: var(--molinex-text-secondary);
}

dd {
  margin: 0;
  text-align: right;
}

.machine-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--molinex-space-xs);
}
</style>
