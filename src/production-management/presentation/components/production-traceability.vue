<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import ProductionProcessFlow from "./production-process-flow.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";

const props = defineProps({
  /** @type {import('../../domain/model/raw-material-reception.entity.js').RawMaterialReception[]} */
  receptions: {type: Array, required: true},
  /** @type {import('../../domain/model/production-batch.entity.js').ProductionBatch[]} */
  batches: {type: Array, required: true},
  /** @type {Map<string, import('../../domain/model/production-record.entity.js').ProductionRecord[]>} */
  recordsByBatchId: {type: Map, required: true}
});

const {t} = useI18n();
const {formatDateTime, formatWeight} = useFormatters();

const sortedReceptions = computed(() =>
    [...props.receptions].sort((first, second) => second.receivedAt.value - first.receivedAt.value));

const batchesByReceptionId = computed(() => {
  const groups = new Map();
  for (const batch of props.batches) {
    groups.set(batch.receptionId.value, [...(groups.get(batch.receptionId.value) ?? []), batch]);
  }
  return groups;
});

/** Batches whose reception is missing: a data integrity problem worth showing. */
const unlinkedBatches = computed(() => {
  const receptionIds = new Set(props.receptions.map(reception => reception.id.value));
  return props.batches.filter(batch => !receptionIds.has(batch.receptionId.value));
});
</script>

<template>
  <section class="panel" aria-labelledby="traceability-title">
    <div class="panel-heading">
      <div>
        <h2 id="traceability-title">{{ t('traceability.title') }}</h2>
        <p class="panel-subtitle">{{ t('traceability.description') }}</p>
      </div>
    </div>

    <empty-state v-if="receptions.length === 0" icon="pi pi-truck" :message="t('traceability.empty')">
      <router-link :to="{name: 'production-reception-new'}">{{ t('receptions.new') }}</router-link>
    </empty-state>

    <ol v-else class="traceability-list">
      <li v-for="reception in sortedReceptions" :key="reception.id.value" class="traceability-row">
        <div class="reception-node">
          <span class="node-icon" aria-hidden="true"><i class="pi pi-truck"></i></span>
          <div class="cell-stack">
            <small>{{ t('traceability.reception', {id: reception.id.value}) }} · {{ formatDateTime(reception.receivedAt.value) }}</small>
            <strong>{{ reception.supplier.name }}</strong>
            <small>{{ reception.origin.description }} · {{ formatWeight(reception.quantity) }}</small>
          </div>
        </div>
        <i class="pi pi-arrow-right connector" aria-hidden="true"></i>
        <div class="batch-nodes">
          <production-process-flow v-for="batch in batchesByReceptionId.get(reception.id.value) ?? []"
                                   :key="batch.id.value" :batch="batch"
                                   :records="recordsByBatchId.get(batch.id.value) ?? []"/>
          <p v-if="!batchesByReceptionId.get(reception.id.value)" class="secondary-text">
            {{ t('traceability.no-batches') }}
          </p>
          <router-link :to="{name: 'production-batch-new', query: {receptionId: reception.id.value}}" class="add-batch">
            <i class="pi pi-plus" aria-hidden="true"></i> {{ t('traceability.add-batch') }}
          </router-link>
        </div>
      </li>
    </ol>

    <pv-message v-if="unlinkedBatches.length" severity="warn" class="mt-3">
      {{ t('traceability.unlinked', {codes: unlinkedBatches.map(batch => batch.code.value).join(', ')}) }}
    </pv-message>
  </section>
</template>

<style scoped>
.traceability-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-m);
}

.traceability-row {
  display: grid;
  grid-template-columns: minmax(14rem, 0.9fr) auto minmax(0, 1.6fr);
  gap: var(--molinex-space-m);
  align-items: start;
  padding-bottom: var(--molinex-space-m);
  border-bottom: 1px dashed var(--molinex-border);
}

.traceability-row:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.reception-node {
  display: flex;
  gap: var(--molinex-space-m);
  padding: var(--molinex-space-m);
  border-radius: var(--molinex-radius);
  background: var(--molinex-blue-light);
}

.node-icon {
  color: var(--molinex-blue);
  font-size: 1.2rem;
}

.connector {
  align-self: center;
  color: var(--molinex-gold-dark);
}

.batch-nodes {
  display: grid;
  gap: var(--molinex-space-s);
  min-width: 0;
}

.add-batch {
  justify-self: start;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
}

@media (max-width: 900px) {
  .traceability-row {
    grid-template-columns: minmax(0, 1fr);
  }

  .connector {
    transform: rotate(90deg);
    justify-self: start;
    margin-left: var(--molinex-space-l);
  }
}
</style>
