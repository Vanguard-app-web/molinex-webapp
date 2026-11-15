<script setup>
import {useI18n} from "vue-i18n";

defineProps({
  /** Permissions to list, e.g. Role.permissions. */
  permissions: {type: Array, required: true},
  /** Id of the element that names the list, for screen readers. */
  labelledBy: {type: String, default: undefined}
});

const {t} = useI18n();
</script>

<template>
  <ul class="permission-list" :aria-labelledby="labelledBy">
    <li v-for="permission in permissions" :key="permission">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      <span>{{ t(`permission.${permission}`) }}</span>
    </li>
    <li v-if="permissions.length === 0" class="none">{{ t('permission-list.none') }}</li>
  </ul>
</template>

<style scoped>
.permission-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-xs);
}

.permission-list li {
  display: flex;
  align-items: center;
  gap: var(--molinex-space-s);
  font-size: 0.9rem;
}

.permission-list .pi {
  color: var(--molinex-green-dark);
}

.none {
  color: var(--molinex-text-secondary);
}
</style>
