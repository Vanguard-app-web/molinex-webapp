<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";

const props = defineProps({
  /** @type {import('../../domain/model/production-record-reference.js').ProductionRecordReference[]} */
  processes: {type: Array, required: true},
  /** Resolves a batch id to its {@link ProductionBatchReference}. */
  batchOf: {type: Function, required: true},
  labelId: {type: String, required: true},
  invalid: {type: Boolean, default: false},
  loading: {type: Boolean, default: false}
});
const model = defineModel({type: String, default: null});

const {t} = useI18n();
const {formatDate} = useFormatters();

const options = computed(() => [...props.processes]
    .sort((first, second) => second.startedAt - first.startedAt)
    .map(process => ({
      value: process.id.value,
      label: `${process.processName} · ${props.batchOf(process.batchId)?.code ?? `#${process.batchId}`} · ${formatDate(process.startedAt)}`,
    })));
</script>

<template>
  <pv-select v-model="model" :options="options" option-label="label" option-value="value" filter fluid
             :placeholder="t('quality.process-placeholder')" :invalid="invalid" :loading="loading"
             :aria-labelledby="labelId"/>
</template>
