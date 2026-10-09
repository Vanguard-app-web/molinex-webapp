<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {toLocalDateKey, useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const {formatDateTime, formatWeight} = useFormatters();
const store = useProductionStore();
const {batches, errors, batchesLoaded, batchesCount, recordsByBatchId} = storeToRefs(store);
const {fetchProductionData, receptionById, hasErrors} = store;
const search = ref('');

onMounted(() => fetchProductionData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const todayKey = toLocalDateKey(new Date());
const registeredToday = computed(() => batches.value.filter(batch => toLocalDateKey(batch.registeredAt.value) === todayKey).length);
const batchesInProcess = computed(() => batches.value.filter(batch => recordsByBatchId.value.has(batch.id.value)).length);

const rows = computed(() => batches.value.map(batch => {
  const reception = receptionById(batch.receptionId);
  return {
    id: batch.id.value,
    code: batch.code.value,
    receptionId: batch.receptionId.value,
    origin: reception?.origin.description ?? null,
    supplier: reception?.supplier.name ?? '—',
    receivedQuantity: reception?.quantity ?? null,
    registeredAt: batch.registeredAt.value,
    processes: recordsByBatchId.value.get(batch.id.value)?.length ?? 0,
  };
}));

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return rows.value;
  return rows.value.filter(row => [row.code, row.receptionId, row.supplier, row.origin ?? '']
      .some(value => value.toLowerCase().includes(term)));
});
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('batches.eyebrow')" :title="t('batches.title')" :description="t('batches.description')">
      <template #actions>
        <link-button :to="{name: 'production-receptions'}" :label="t('receptions.title')" icon="pi pi-truck" outlined/>
        <link-button :to="{name: 'production-batch-new'}" :label="t('batches.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchProductionData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-box" :label="t('batches.metrics.total')" :value="batchesCount"/>
      <metric-card icon="pi pi-calendar" tone="green" :label="t('batches.metrics.today')" :value="registeredToday"/>
      <metric-card icon="pi pi-cog" tone="gold" :label="t('batches.metrics.in-process')" :value="batchesInProcess"/>
    </div>

    <section class="panel" aria-labelledby="batches-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="batches-table-title">{{ t('batches.table-title') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: filteredRows.length}) }}</p>
        </div>
        <pv-icon-field>
          <pv-input-icon class="pi pi-search"/>
          <pv-input-text v-model="search" type="search" :placeholder="t('batches.search')" :aria-label="t('batches.search')"/>
        </pv-icon-field>
      </div>

      <pv-data-table :value="filteredRows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="registeredAt" :sort-order="-1" striped-rows table-style="min-width: 56rem"
                     :loading="!batchesLoaded && !hasErrors('fetch-batches')">
        <template #empty>
          <empty-state icon="pi pi-box" :message="loadErrors.length ? t('common.unavailable') : search ? t('common.no-results') : t('batches.empty')"/>
        </template>
        <pv-column field="code" :header="t('batches.columns.code')" sortable>
          <template #body="{data}"><strong>{{ data.code }}</strong></template>
        </pv-column>
        <pv-column field="receptionId" :header="t('batches.columns.reception')" sortable>
          <template #body="{data}">
            <div class="cell-stack">
              <span>#{{ data.receptionId }}</span>
              <small v-if="data.origin">{{ data.origin }}</small>
              <small v-else class="missing">{{ t('batches.missing-reception') }}</small>
            </div>
          </template>
        </pv-column>
        <pv-column field="supplier" :header="t('batches.columns.supplier')" sortable/>
        <pv-column :header="t('batches.columns.received-quantity')">
          <template #body="{data}">{{ formatWeight(data.receivedQuantity) }}</template>
        </pv-column>
        <pv-column field="registeredAt" :header="t('batches.columns.registered-at')" sortable>
          <template #body="{data}">{{ formatDateTime(data.registeredAt) }}</template>
        </pv-column>
        <pv-column field="processes" :header="t('batches.columns.processes')" sortable/>
        <pv-column :header="t('common.actions')">
          <template #body="{data}">
            <div class="row-actions">
              <link-button :to="{name: 'production-record-new', query: {batchId: data.id}}"
                           :label="t('batches.record-process')" icon="pi pi-plus" text size="small"/>
              <link-button :to="{name: 'production-records', query: {batchId: data.id}}"
                           :label="t('batches.view-processes')" icon="pi pi-list" text size="small"/>
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>

<style scoped>
.missing {
  color: var(--molinex-warning) !important;
}
</style>
