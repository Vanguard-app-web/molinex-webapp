<script setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useQualityStore from "../../application/quality.store.js";
import {QualityIndicator} from "../../domain/model/quality-indicator.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const {formatDateTime, formatPercentage} = useFormatters();
const store = useQualityStore();
const {assessments, errors, assessmentsLoaded, assessmentsCount, averageWholeGrain, averageBrokenGrain, averageYield} = storeToRefs(store);
const {fetchQualityData, productionRecordById, productionBatchById, hasErrors} = store;

onMounted(() => fetchQualityData());

const loadErrors = computed(() => errors.value.filter(error => error.operation.startsWith('fetch-')));

const rows = computed(() => assessments.value.map(assessment => {
  const process = productionRecordById(assessment.productionRecordId);
  return {
    id: assessment.id.value,
    assessedAt: assessment.assessedAt.value,
    processName: process?.processName ?? `#${assessment.productionRecordId.value}`,
    batchCode: process ? (productionBatchById(process.batchId)?.code ?? `#${process.batchId}`) : '—',
    wholeGrain: assessment.measurementValue(QualityIndicator.WHOLE_GRAIN_PERCENTAGE),
    brokenGrain: assessment.measurementValue(QualityIndicator.BROKEN_GRAIN_PERCENTAGE),
    yieldValue: assessment.measurementValue(QualityIndicator.YIELD_PERCENTAGE),
  };
}));
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('quality-assessments.eyebrow')" :title="t('quality-assessments.title')"
                 :description="t('quality-assessments.description')">
      <template #actions>
        <link-button :to="{name: 'quality-waste'}" :label="t('waste-records.title')" icon="pi pi-chart-pie" outlined/>
        <link-button :to="{name: 'quality-assessment-new'}" :label="t('quality-assessments.new')" icon="pi pi-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchQualityData()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-circle-fill" tone="green" :label="t('quality-assessments.metrics.whole-grain')"
                   :value="formatPercentage(averageWholeGrain)" :hint="t('quality-assessments.metrics.average')"/>
      <metric-card icon="pi pi-circle" tone="gold" :label="t('quality-assessments.metrics.broken-grain')"
                   :value="formatPercentage(averageBrokenGrain)" :hint="t('quality-assessments.metrics.average')"/>
      <metric-card icon="pi pi-chart-line" :label="t('quality-assessments.metrics.yield')"
                   :value="formatPercentage(averageYield)" :hint="t('quality-assessments.metrics.average')"/>
      <metric-card icon="pi pi-verified" tone="neutral" :label="t('quality-assessments.metrics.total')" :value="assessmentsCount"/>
    </div>

    <section class="panel" aria-labelledby="assessments-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="assessments-table-title">{{ t('quality-assessments.table-title') }}</h2>
          <p class="panel-subtitle">{{ t('common.results', {count: rows.length}) }}</p>
        </div>
      </div>
      <pv-data-table :value="rows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="assessedAt" :sort-order="-1" striped-rows table-style="min-width: 56rem"
                     :loading="!assessmentsLoaded && !hasErrors('fetch-assessments')">
        <template #empty>
          <empty-state icon="pi pi-verified" :message="loadErrors.length ? t('common.unavailable') : t('quality-assessments.empty')"/>
        </template>
        <pv-column field="assessedAt" :header="t('quality-assessments.columns.assessed-at')" sortable>
          <template #body="{data}">{{ formatDateTime(data.assessedAt) }}</template>
        </pv-column>
        <pv-column field="processName" :header="t('quality-assessments.columns.process')" sortable>
          <template #body="{data}">
            <div class="cell-stack"><strong>{{ data.processName }}</strong><small>{{ data.batchCode }}</small></div>
          </template>
        </pv-column>
        <pv-column field="wholeGrain" :header="t('quality-indicator.WHOLE_GRAIN_PERCENTAGE')" sortable>
          <template #body="{data}">{{ formatPercentage(data.wholeGrain) }}</template>
        </pv-column>
        <pv-column field="brokenGrain" :header="t('quality-indicator.BROKEN_GRAIN_PERCENTAGE')" sortable>
          <template #body="{data}">{{ formatPercentage(data.brokenGrain) }}</template>
        </pv-column>
        <pv-column field="yieldValue" :header="t('quality-indicator.YIELD_PERCENTAGE')" sortable>
          <template #body="{data}">{{ formatPercentage(data.yieldValue) }}</template>
        </pv-column>
        <pv-column :header="t('quality-assessments.columns.composition')">
          <template #body="{data}">
            <div class="composition-bar" aria-hidden="true">
              <span class="whole" :style="{width: `${data.wholeGrain ?? 0}%`}"></span>
              <span class="broken" :style="{width: `${data.brokenGrain ?? 0}%`}"></span>
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>

<style scoped>
.composition-bar {
  display: flex;
  width: 8rem;
  height: 0.6rem;
  border-radius: 999px;
  overflow: hidden;
  background: var(--molinex-border);
}

.composition-bar .whole {
  background: var(--molinex-green);
}

.composition-bar .broken {
  background: var(--molinex-gold);
}
</style>
