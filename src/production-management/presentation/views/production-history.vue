<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {ProductionStatus, productionStatuses} from "../../domain/model/production-status.js";
import {toLocalDateKey, useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import ProductionStatusTag from "../components/production-status-tag.vue";

const {t, n} = useI18n();
const {formatDay, formatTime, formatWeight} = useFormatters();
const store = useProductionStore();
const {batches, productionRecords, errors, recordsLoaded} = storeToRefs(store);
const {fetchProductionData, batchById} = store;

const dateFrom = ref(null);
const dateTo = ref(null);
const batchFilter = ref(null);
const statusFilter = ref(null);

onMounted(() => fetchProductionData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const batchOptions = computed(() => batches.value.map(batch => ({value: batch.id.value, label: batch.code.value})));
const statusOptions = computed(() => productionStatuses.map(status => ({value: status, label: t(`production-status.${status}`)})));
const fromKey = computed(() => (dateFrom.value ? toLocalDateKey(dateFrom.value) : null));
const toKey = computed(() => (dateTo.value ? toLocalDateKey(dateTo.value) : null));
const invalidPeriod = computed(() => Boolean(fromKey.value && toKey.value && fromKey.value > toKey.value));

const filteredRecords = computed(() => {
  if (invalidPeriod.value) return [];
  return productionRecords.value
      .filter(record => {
        const day = toLocalDateKey(record.details.period.startedAt);
        return (!fromKey.value || day >= fromKey.value) && (!toKey.value || day <= toKey.value)
            && (!batchFilter.value || record.batchId.value === batchFilter.value)
            && (!statusFilter.value || record.details.status === statusFilter.value);
      })
      .sort((first, second) => second.details.period.startedAt - first.details.period.startedAt);
});

const historyByDay = computed(() => {
  const days = new Map();
  for (const record of filteredRecords.value) {
    const key = toLocalDateKey(record.details.period.startedAt);
    days.set(key, [...(days.get(key) ?? []), record]);
  }
  return [...days.entries()].map(([key, records]) => ({key, date: records[0].details.period.startedAt, records}));
});

const processedKilograms = computed(() =>
    filteredRecords.value.reduce((total, record) => total + record.details.processedWeight.toKilograms(), 0));
const completedCount = computed(() => filteredRecords.value.filter(record => record.details.status === ProductionStatus.COMPLETED).length);
const batchCount = computed(() => new Set(filteredRecords.value.map(record => record.batchId.value)).size);

function clearFilters() {
  dateFrom.value = null;
  dateTo.value = null;
  batchFilter.value = null;
  statusFilter.value = null;
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('production-history.eyebrow')" :title="t('production-history.title')"
                 :description="t('production-history.description')">
      <template #actions>
        <link-button :to="{name: 'production-records'}" :label="t('production-records.title')" icon="pi pi-list" outlined/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchProductionData()"/>

    <section class="panel" aria-labelledby="history-filters-title">
      <div class="panel-heading">
        <h2 id="history-filters-title">{{ t('filters.title') }}</h2>
        <pv-button :label="t('filters.clear')" icon="pi pi-filter-slash" text @click="clearFilters"/>
      </div>
      <div class="filters-bar">
        <div>
          <label for="history-from">{{ t('filters.from') }}</label>
          <pv-date-picker v-model="dateFrom" input-id="history-from" date-format="yy-mm-dd" show-icon :show-on-focus="false" show-clear fluid/>
        </div>
        <div>
          <label for="history-to">{{ t('filters.to') }}</label>
          <pv-date-picker v-model="dateTo" input-id="history-to" date-format="yy-mm-dd" show-icon :show-on-focus="false" show-clear fluid
                          :invalid="invalidPeriod"/>
        </div>
        <div>
          <label id="history-batch">{{ t('filters.batch') }}</label>
          <pv-select v-model="batchFilter" :options="batchOptions" option-label="label" option-value="value" filter show-clear
                     :placeholder="t('filters.all-batches')" fluid aria-labelledby="history-batch"/>
        </div>
        <div>
          <label id="history-status">{{ t('filters.status') }}</label>
          <pv-select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" show-clear
                     :placeholder="t('filters.all-statuses')" fluid aria-labelledby="history-status"/>
        </div>
      </div>
      <pv-message v-if="invalidPeriod" severity="warn">{{ t('filters.invalid-period') }}</pv-message>
    </section>

    <div class="metrics-grid">
      <metric-card icon="pi pi-cog" :label="t('production-history.metrics.processes')" :value="filteredRecords.length"/>
      <metric-card icon="pi pi-database" tone="gold" :label="t('production-history.metrics.weight')"
                   :value="`${n(processedKilograms, 'decimal')} ${t('units.KILOGRAM')}`"/>
      <metric-card icon="pi pi-check-circle" tone="green" :label="t('production-history.metrics.completed')" :value="completedCount"/>
      <metric-card icon="pi pi-box" tone="neutral" :label="t('production-history.metrics.batches')" :value="batchCount"/>
    </div>

    <section class="panel" aria-labelledby="history-timeline-title">
      <div class="panel-heading">
        <h2 id="history-timeline-title">{{ t('production-history.timeline') }}</h2>
        <span class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: filteredRecords.length}) }}</span>
      </div>
      <div v-if="!recordsLoaded && loadErrors.length === 0" role="status" class="secondary-text">{{ t('common.loading') }}</div>
      <empty-state v-else-if="historyByDay.length === 0" icon="pi pi-history" :message="loadErrors.length ? t('common.unavailable') : t('production-history.empty')"/>
      <ol v-else class="timeline">
        <li v-for="day in historyByDay" :key="day.key" class="timeline-day">
          <h3><time :datetime="day.key">{{ formatDay(day.date) }}</time></h3>
          <ul>
            <li v-for="record in day.records" :key="record.id.value" class="timeline-record">
              <div class="cell-stack">
                <strong>{{ record.details.processName.value }}</strong>
                <small>
                  {{ batchById(record.batchId)?.code.value ?? `#${record.batchId.value}` }} ·
                  {{ formatWeight(record.details.processedWeight) }} ·
                  {{ formatTime(record.details.period.startedAt) }}<template v-if="record.details.period.finishedAt">
                  – {{ formatTime(record.details.period.finishedAt) }}</template>
                </small>
              </div>
              <production-status-tag :status="record.details.status"/>
            </li>
          </ul>
        </li>
      </ol>
    </section>
  </section>
</template>

<style scoped>
.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-l);
}

.timeline-day h3 {
  font-size: 0.95rem;
  color: var(--molinex-text-secondary);
  margin-bottom: var(--molinex-space-s);
}

.timeline-day h3::first-letter {
  text-transform: uppercase;
}

.timeline-day ul {
  list-style: none;
  margin: 0;
  padding: 0 0 0 var(--molinex-space-m);
  border-left: 2px solid var(--molinex-border);
  display: grid;
  gap: var(--molinex-space-s);
}

.timeline-record {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-s) var(--molinex-space-m);
  border-radius: 0.6rem;
  background: var(--molinex-background);
}
</style>
