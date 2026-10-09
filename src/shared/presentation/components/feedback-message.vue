<script setup>
import {useI18n} from "vue-i18n";

defineProps({
  /** Errors kept by a store: {operation, message}, both i18n keys under "operations" and the message itself. */
  errors: {type: Array, required: true},
  retryable: {type: Boolean, default: false}
});
defineEmits(['retry']);

const {t} = useI18n();
</script>

<template>
  <pv-message v-if="errors.length" severity="error" class="feedback-message">
    <div class="feedback-content">
      <ul>
        <li v-for="(error, index) in errors" :key="`${error.operation}-${index}`">
          <strong>{{ t(`operations.${error.operation}`) }}:</strong> {{ t(error.message) }}
        </li>
      </ul>
      <pv-button v-if="retryable" :label="t('common.retry')" icon="pi pi-refresh" size="small" severity="danger"
                 outlined @click="$emit('retry')"/>
    </div>
  </pv-message>
</template>

<style scoped>
.feedback-content {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-m);
  width: 100%;
}

ul {
  margin: 0;
  padding-left: 1rem;
}
</style>
