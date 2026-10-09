<script setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useProductionStore from "../../application/production.store.js";
import {ProductionStatus} from "../../domain/model/production-status.js";
import {toLocalDateKey, useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import ProductionTraceability from "../components/production-traceability.vue";

const RECENT_ACTIVITY_LIMIT = 6;

const {t, n} = useI18n();
const {formatDateTime, formatWeight} = useFormatters();
const store = useProductionStore();
const {receptions, batches, productionRecords, errors, receptionsLoaded, batchesLoaded, recordsLoaded,
  receptionsCount, batchesCount, productionRecordsCount, recordsByBatchId} = storeToRefs(store);
const {fetchProductionData, receptionById} = store;

onMounted(() => fetchProductionData());

const loaded = computed(() => receptionsLoaded.value && batchesLoaded.value && recordsLoaded.value);
const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));
const todayKey = toLocalDateKey(new Date());
const receivedToday = computed(() => receptions.value.filter(reception => toLocalDateKey(reception.receivedAt.value) === todayKey).length);
const registeredToday = computed(() => batches.value.filter(batch => toLocalDateKey(batch.registeredAt.value) === todayKey).length);
const inProgress = computed(() => productionRecords.value.filter(record => record.details.status === ProductionStatus.IN_PROGRESS).length);
const linkedBatches = computed(() => batches.value.filter(batch => receptionById(batch.receptionId)).length);
const traceability = computed(() => (batchesCount.value === 0 ? 0 : (linkedBatches.value / batchesCount.value) * 100));

const recentActivity = computed(() => [
  ...receptions.value.map(reception => ({
    key: `reception-${reception.id.value}`, icon: 'pi pi-truck', occurredAt: reception.receivedAt.value,
    title: reception.supplier.name, detail: `${reception.origin.description} · ${formatWeight(reception.quantity)}`,
  })),
  ...batches.value.map(batch => ({
    key: `batch-${batch.id.value}`, icon: 'pi pi-box', occurredAt: batch.registeredAt.value,
    title: batch.code.value, detail: t('traceability.reception', {id: batch.receptionId.value}),
  })),
].sort((first, second) => second.occurredAt - first.occurredAt).slice(0, RECENT_ACTIVITY_LIMIT));
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('production-overview.eyebrow')" :title="t('production-overview.title')"
                 :description="t('production-overview.description')">
      <template #actions>
        <link-button :to="{name: 'production-history'}" :label="t('production-history.title')" icon="pi pi-history" outlined/>
        <link-button :to="{name: 'production-reception-new'}" :label="t('receptions.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchProductionData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-truck" :label="t('production-overview.metrics.receptions')" :value="receptionsCount"
                   :hint="t('production-overview.metrics.today', {count: receivedToday})"/>
      <metric-card icon="pi pi-box" tone="green" :label="t('production-overview.metrics.batches')" :value="batchesCount"
                   :hint="t('production-overview.metrics.today', {count: registeredToday})"/>
      <metric-card icon="pi pi-cog" tone="gold" :label="t('production-overview.metrics.processes')" :value="productionRecordsCount"
                   :hint="t('production-overview.metrics.in-progress', {count: inProgress})"/>
      <metric-card icon="pi pi-sitemap" tone="neutral" :label="t('production-overview.metrics.traceability')"
                   :value="`${n(traceability, 'integer')} %`"
                   :hint="t('production-overview.metrics.linked', {linked: linkedBatches, total: batchesCount})"/>
    </div>

    <div v-if="!loaded && loadErrors.length === 0" class="loading" role="status">
      <pv-progress-spinner style="width: 2.5rem; height: 2.5rem" :stroke-width="5" :aria-label="t('common.loading')"/>
      <span>{{ t('common.loading') }}</span>
    </div>

    <div v-else class="overview-grid">
      <production-traceability :receptions="receptions" :batches="batches" :records-by-batch-id="recordsByBatchId"/>

      <section class="panel" aria-labelledby="recent-activity-title">
        <div class="panel-heading">
          <h2 id="recent-activity-title">{{ t('production-overview.activity') }}</h2>
        </div>
        <ol class="activity-list">
          <li v-for="activity in recentActivity" :key="activity.key">
            <span class="activity-icon" aria-hidden="true"><i :class="activity.icon"></i></span>
            <div class="cell-stack">
              <strong>{{ activity.title }}</strong>
              <small>{{ activity.detail }}</small>
              <small><time :datetime="activity.occurredAt.toISOString()">{{ formatDateTime(activity.occurredAt) }}</time></small>
            </div>
          </li>
        </ol>
      </section>
    </div>
  </section>
</template>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: minmax(0, 2.2fr) minmax(16rem, 1fr);
  gap: var(--molinex-space-l);
  align-items: start;
}

.loading {
  display: flex;
  align-items: center;
  gap: var(--molinex-space-m);
  color: var(--molinex-text-secondary);
}

.activity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-m);
}

.activity-list li {
  display: flex;
  gap: var(--molinex-space-m);
}

.activity-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: var(--molinex-blue-light);
  color: var(--molinex-blue);
}

@media (max-width: 1200px) {
  .overview-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
