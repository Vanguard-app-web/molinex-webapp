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
const {receptions, batches, errors, receptionsLoaded, receptionsCount} = storeToRefs(store);
const {fetchProductionData, hasErrors} = store;
const search = ref('');

onMounted(() => fetchProductionData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const todayKey = toLocalDateKey(new Date());
const receivedToday = computed(() => receptions.value.filter(reception => toLocalDateKey(reception.receivedAt.value) === todayKey).length);
const supplierCount = computed(() => new Set(receptions.value.map(reception => reception.supplier.name.toLowerCase())).size);

const rows = computed(() => {
  const batchCount = new Map();
  for (const batch of batches.value) batchCount.set(batch.receptionId.value, (batchCount.get(batch.receptionId.value) ?? 0) + 1);
  return receptions.value.map(reception => ({
    id: reception.id.value,
    receivedAt: reception.receivedAt.value,
    supplier: reception.supplier.name,
    origin: reception.origin.description,
    quantity: reception.quantity,
    quantityInKilograms: reception.quantity.toKilograms(),
    batches: batchCount.get(reception.id.value) ?? 0,
  }));
});

const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return rows.value;
  return rows.value.filter(row => [row.id, row.supplier, row.origin].some(value => value.toLowerCase().includes(term)));
});
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('receptions.eyebrow')" :title="t('receptions.title')" :description="t('receptions.description')">
      <template #actions>
        <link-button :to="{name: 'production-batches'}" :label="t('batches.title')" icon="pi pi-box" outlined/>
        <link-button :to="{name: 'production-reception-new'}" :label="t('receptions.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchProductionData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-truck" :label="t('receptions.metrics.total')" :value="receptionsCount"/>
      <metric-card icon="pi pi-calendar" tone="green" :label="t('receptions.metrics.today')" :value="receivedToday"/>
      <metric-card icon="pi pi-users" tone="gold" :label="t('receptions.metrics.suppliers')" :value="supplierCount"/>
    </div>

    <section class="panel" aria-labelledby="receptions-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="receptions-table-title">{{ t('receptions.table-title') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: filteredRows.length}) }}</p>
        </div>
        <pv-icon-field>
          <pv-input-icon class="pi pi-search"/>
          <pv-input-text v-model="search" type="search" :placeholder="t('receptions.search')" :aria-label="t('receptions.search')"/>
        </pv-icon-field>
      </div>

      <pv-data-table :value="filteredRows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="receivedAt" :sort-order="-1" striped-rows table-style="min-width: 52rem"
                     :loading="!receptionsLoaded && !hasErrors('fetch-receptions')">
        <template #empty>
          <empty-state icon="pi pi-truck" :message="loadErrors.length ? t('common.unavailable') : search ? t('common.no-results') : t('receptions.empty')"/>
        </template>
        <pv-column field="id" :header="t('receptions.columns.id')" sortable>
          <template #body="{data}"><strong>#{{ data.id }}</strong></template>
        </pv-column>
        <pv-column field="receivedAt" :header="t('receptions.columns.received-at')" sortable>
          <template #body="{data}">{{ formatDateTime(data.receivedAt) }}</template>
        </pv-column>
        <pv-column field="supplier" :header="t('receptions.columns.supplier')" sortable/>
        <pv-column field="origin" :header="t('receptions.columns.origin')" sortable/>
        <pv-column field="quantityInKilograms" :header="t('receptions.columns.quantity')" sortable>
          <template #body="{data}">{{ formatWeight(data.quantity) }}</template>
        </pv-column>
        <pv-column field="batches" :header="t('receptions.columns.batches')" sortable/>
        <pv-column :header="t('common.actions')">
          <template #body="{data}">
            <link-button :to="{name: 'production-batch-new', query: {receptionId: data.id}}"
                         :label="t('receptions.create-batch')" icon="pi pi-box" text size="small"/>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>
