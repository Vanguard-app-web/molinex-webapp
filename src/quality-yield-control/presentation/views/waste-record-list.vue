<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useQualityStore from "../../application/quality.store.js";
import {toLocalDateKey, useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t, n} = useI18n();
const {formatDateTime, formatWeight, formatPercentage} = useFormatters();
const store = useQualityStore();
const {wasteRecords, productionBatches, errors, wasteRecordsLoaded, wasteRecordsCount} = storeToRefs(store);
const {fetchQualityData, productionRecordById, productionBatchById, hasErrors} = store;

const batchFilter = ref(null);
const dateFrom = ref(null);
const dateTo = ref(null);

onMounted(() => fetchQualityData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const batchOptions = computed(() => productionBatches.value.map(batch => ({value: batch.id, label: batch.code})));
const fromKey = computed(() => (dateFrom.value ? toLocalDateKey(dateFrom.value) : null));
const toKey = computed(() => (dateTo.value ? toLocalDateKey(dateTo.value) : null));
const invalidPeriod = computed(() => Boolean(fromKey.value && toKey.value && fromKey.value > toKey.value));

const rows = computed(() => {
  if (invalidPeriod.value) return [];
  return wasteRecords.value
      .map(waste => {
        const process = productionRecordById(waste.productionRecordId);
        return {
          id: waste.id.value,
          recordedAt: waste.recordedAt,
          batchId: process?.batchId ?? null,
          batchCode: process ? (productionBatchById(process.batchId)?.code ?? `#${process.batchId}`) : '—',
          processName: process?.processName ?? `#${waste.productionRecordId.value}`,
          quantity: waste.quantity,
          quantityInKilograms: waste.quantity.toKilograms(),
          percentage: waste.percentage?.value ?? null,
        };
      })
      .filter(row => !batchFilter.value || row.batchId === batchFilter.value)
      .filter(row => {
        const day = toLocalDateKey(row.recordedAt);
        return (!fromKey.value || day >= fromKey.value) && (!toKey.value || day <= toKey.value);
      });
});

const totalKilograms = computed(() => rows.value.reduce((total, row) => total + row.quantityInKilograms, 0));
const averagePercentage = computed(() => {
  const percentages = rows.value.map(row => row.percentage).filter(value => value !== null);
  return percentages.length ? percentages.reduce((total, value) => total + value, 0) / percentages.length : null;
});

function clearFilters() {
  batchFilter.value = null;
  dateFrom.value = null;
  dateTo.value = null;
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('waste-records.eyebrow')" :title="t('waste-records.title')" :description="t('waste-records.description')">
      <template #actions>
        <link-button :to="{name: 'quality-assessments'}" :label="t('quality-assessments.title')" icon="pi pi-verified" outlined/>
        <link-button :to="{name: 'quality-waste-new'}" :label="t('waste-records.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchQualityData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-list" :label="t('waste-records.metrics.records')" :value="rows.length"
                   :hint="t('waste-records.metrics.of-total', {total: wasteRecordsCount})"/>
      <metric-card icon="pi pi-database" tone="gold" :label="t('waste-records.metrics.weight')"
                   :value="`${n(totalKilograms, 'decimal')} ${t('units.KILOGRAM')}`"/>
      <metric-card icon="pi pi-percentage" tone="critical" :label="t('waste-records.metrics.average')"
                   :value="formatPercentage(averagePercentage)"/>
    </div>

    <section class="panel" aria-labelledby="waste-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="waste-table-title">{{ t('waste-records.table-title') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: rows.length}) }}</p>
        </div>
        <pv-button :label="t('filters.clear')" icon="pi pi-filter-slash" text @click="clearFilters"/>
      </div>
      <div class="filters-bar">
        <div>
          <label id="waste-batch-filter">{{ t('filters.batch') }}</label>
          <pv-select v-model="batchFilter" :options="batchOptions" option-label="label" option-value="value" filter show-clear
                     :placeholder="t('filters.all-batches')" fluid aria-labelledby="waste-batch-filter"/>
        </div>
        <div>
          <label for="waste-from">{{ t('filters.from') }}</label>
          <pv-date-picker v-model="dateFrom" input-id="waste-from" date-format="yy-mm-dd" show-icon :show-on-focus="false" show-clear fluid/>
        </div>
        <div>
          <label for="waste-to">{{ t('filters.to') }}</label>
          <pv-date-picker v-model="dateTo" input-id="waste-to" date-format="yy-mm-dd" show-icon :show-on-focus="false" show-clear fluid :invalid="invalidPeriod"/>
        </div>
      </div>
      <pv-message v-if="invalidPeriod" severity="warn" class="mb-3">{{ t('filters.invalid-period') }}</pv-message>

      <pv-data-table :value="rows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="recordedAt" :sort-order="-1" striped-rows table-style="min-width: 48rem"
                     :loading="!wasteRecordsLoaded && !hasErrors('fetch-waste-records')">
        <template #empty>
          <empty-state icon="pi pi-chart-pie"
                       :message="loadErrors.length ? t('common.unavailable') : batchFilter || dateFrom || dateTo ? t('common.no-results') : t('waste-records.empty')"/>
        </template>
        <pv-column field="recordedAt" :header="t('waste-records.columns.recorded-at')" sortable>
          <template #body="{data}">{{ formatDateTime(data.recordedAt) }}</template>
        </pv-column>
        <pv-column field="batchCode" :header="t('waste-records.columns.batch')" sortable/>
        <pv-column field="processName" :header="t('waste-records.columns.process')" sortable/>
        <pv-column field="quantityInKilograms" :header="t('waste-records.columns.quantity')" sortable>
          <template #body="{data}">{{ formatWeight(data.quantity) }}</template>
        </pv-column>
        <pv-column field="percentage" :header="t('waste-records.columns.percentage')" sortable>
          <template #body="{data}">
            <pv-tag :value="formatPercentage(data.percentage)" severity="secondary" rounded/>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>
