<script setup>
import {useI18n} from "vue-i18n";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import ProductionStatusTag from "./production-status-tag.vue";

defineProps({
  /** @type {import('../../domain/model/production-batch.entity.js').ProductionBatch} */
  batch: {type: Object, required: true},
  /** @type {import('../../domain/model/production-record.entity.js').ProductionRecord[]} */
  records: {type: Array, required: true}
});

const {t} = useI18n();
const {formatDateTime, formatWeight} = useFormatters();
</script>

<template>
  <article class="batch-flow">
    <header class="batch-heading">
      <i class="pi pi-box" aria-hidden="true"></i>
      <div class="cell-stack">
        <strong>{{ batch.code.value }}</strong>
        <small>{{ formatDateTime(batch.registeredAt.value) }}</small>
      </div>
      <router-link :to="{name: 'production-record-new', query: {batchId: batch.id.value}}" class="flow-link">
        <i class="pi pi-plus" aria-hidden="true"></i> {{ t('traceability.record-process') }}
      </router-link>
    </header>

    <p v-if="records.length === 0" class="secondary-text">{{ t('traceability.no-processes') }}</p>
    <ul v-else class="process-list">
      <li v-for="record in records" :key="record.id.value" class="process-node">
        <div class="cell-stack">
          <strong>{{ record.details.processName.value }}</strong>
          <small>{{ formatWeight(record.details.processedWeight) }} · {{ formatDateTime(record.details.period.startedAt) }}</small>
        </div>
        <production-status-tag :status="record.details.status"/>
        <div class="row-actions">
          <router-link :to="{name: 'quality-assessment-new', query: {productionRecordId: record.id.value}}"
                       class="icon-link" :aria-label="t('traceability.assess-quality', {process: record.details.processName.value})"
                       :title="t('traceability.assess-quality', {process: record.details.processName.value})">
            <i class="pi pi-verified" aria-hidden="true"></i>
          </router-link>
          <router-link :to="{name: 'quality-waste-new', query: {productionRecordId: record.id.value}}"
                       class="icon-link" :aria-label="t('traceability.record-waste', {process: record.details.processName.value})"
                       :title="t('traceability.record-waste', {process: record.details.processName.value})">
            <i class="pi pi-chart-pie" aria-hidden="true"></i>
          </router-link>
          <router-link :to="{name: 'production-record-edit', params: {id: record.id.value}}"
                       class="icon-link" :aria-label="t('traceability.edit-process', {process: record.details.processName.value})"
                       :title="t('traceability.edit-process', {process: record.details.processName.value})">
            <i class="pi pi-pencil" aria-hidden="true"></i>
          </router-link>
        </div>
      </li>
    </ul>
  </article>
</template>

<style scoped>
.batch-flow {
  display: grid;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-m);
  border: 1px solid var(--molinex-border);
  border-left: 0.25rem solid var(--molinex-green);
  border-radius: var(--molinex-radius);
  background: var(--molinex-surface);
}

.batch-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--molinex-space-s) var(--molinex-space-m);
}

.batch-heading > .pi {
  color: var(--molinex-green-dark);
}

.flow-link {
  margin-left: auto;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

.process-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-s);
}

.process-node {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-s) var(--molinex-space-m);
  border-radius: 0.6rem;
  background: var(--molinex-background);
}

.icon-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  color: var(--molinex-blue);
}

.icon-link:hover {
  background: var(--molinex-blue-light);
}
</style>
