<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {productionStatuses} from "../../domain/model/production-status.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import ProductionStatusTag from "../components/production-status-tag.vue";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const {formatDateTime, formatWeight} = useFormatters();
const store = useProductionStore();
const {batches, productionRecords, errors, recordsLoaded} = storeToRefs(store);
const {fetchProductionData, batchById, hasErrors} = store;

const batchFilter = ref(route.query.batchId ? String(route.query.batchId) : null);
const statusFilter = ref(null);

onMounted(() => fetchProductionData());

/** Keeps the batch filter in the address, so "view processes" links and the back button work. */
watch(batchFilter, batchId => router.replace({query: batchId ? {batchId} : {}}));

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const batchOptions = computed(() => batches.value.map(batch => ({value: batch.id.value, label: batch.code.value})));
const statusOptions = computed(() => productionStatuses.map(status => ({value: status, label: t(`production-status.${status}`)})));

const rows = computed(() => productionRecords.value
    .filter(record => !batchFilter.value || record.batchId.value === batchFilter.value)
    .filter(record => !statusFilter.value || record.details.status === statusFilter.value)
    .map(record => ({
      id: record.id.value,
      batchCode: batchById(record.batchId)?.code.value ?? `#${record.batchId.value}`,
      processName: record.details.processName.value,
      processedWeight: record.details.processedWeight,
      processedKilograms: record.details.processedWeight.toKilograms(),
      startedAt: record.details.period.startedAt,
      finishedAt: record.details.period.finishedAt,
      status: record.details.status,
    })));

function clearFilters() {
  batchFilter.value = null;
  statusFilter.value = null;
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('production-records.eyebrow')" :title="t('production-records.title')"
                 :description="t('production-records.description')">
      <template #actions>
        <link-button :to="{name: 'production-history'}" :label="t('production-history.title')" icon="pi pi-history" outlined/>
        <link-button :to="{name: 'production-record-new', query: batchFilter ? {batchId: batchFilter} : {}}"
                     :label="t('production-records.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchProductionData()"/>

    <section class="panel" aria-labelledby="records-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="records-table-title">{{ t('production-records.table-title') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: rows.length}) }}</p>
        </div>
      </div>

      <div class="filters-bar">
        <div>
          <label id="records-batch-filter">{{ t('filters.batch') }}</label>
          <pv-select v-model="batchFilter" :options="batchOptions" option-label="label" option-value="value" filter show-clear
                     :placeholder="t('filters.all-batches')" fluid aria-labelledby="records-batch-filter"/>
        </div>
        <div>
          <label id="records-status-filter">{{ t('filters.status') }}</label>
          <pv-select v-model="statusFilter" :options="statusOptions" option-label="label" option-value="value" show-clear
                     :placeholder="t('filters.all-statuses')" fluid aria-labelledby="records-status-filter"/>
        </div>
        <div>
          <pv-button :label="t('filters.clear')" icon="pi pi-filter-slash" text @click="clearFilters"/>
        </div>
      </div>

      <pv-data-table :value="rows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="startedAt" :sort-order="-1" striped-rows table-style="min-width: 60rem"
                     :loading="!recordsLoaded && !hasErrors('fetch-production-records')">
        <template #empty>
          <empty-state icon="pi pi-cog" :message="loadErrors.length ? t('common.unavailable') : batchFilter || statusFilter ? t('common.no-results') : t('production-records.empty')"/>
        </template>
        <pv-column field="batchCode" :header="t('production-records.columns.batch')" sortable>
          <template #body="{data}"><strong>{{ data.batchCode }}</strong></template>
        </pv-column>
        <pv-column field="processName" :header="t('production-records.columns.process')" sortable/>
        <pv-column field="processedKilograms" :header="t('production-records.columns.weight')" sortable>
          <template #body="{data}">{{ formatWeight(data.processedWeight) }}</template>
        </pv-column>
        <pv-column field="startedAt" :header="t('production-records.columns.started-at')" sortable>
          <template #body="{data}">{{ formatDateTime(data.startedAt) }}</template>
        </pv-column>
        <pv-column field="finishedAt" :header="t('production-records.columns.finished-at')">
          <template #body="{data}">{{ data.finishedAt ? formatDateTime(data.finishedAt) : t('production-records.running') }}</template>
        </pv-column>
        <pv-column field="status" :header="t('production-records.columns.status')" sortable>
          <template #body="{data}"><production-status-tag :status="data.status"/></template>
        </pv-column>
        <pv-column :header="t('common.actions')">
          <template #body="{data}">
            <div class="row-actions">
              <link-button :to="{name: 'production-record-edit', params: {id: data.id}}" :label="t('common.edit')"
                           icon="pi pi-pencil" text size="small"/>
              <link-button :to="{name: 'quality-assessment-new', query: {productionRecordId: data.id}}"
                           :label="t('production-records.assess-quality')" icon="pi pi-verified" text size="small"/>
              <link-button :to="{name: 'quality-waste-new', query: {productionRecordId: data.id}}"
                           :label="t('production-records.record-waste')" icon="pi pi-chart-pie" text size="small"/>
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>
