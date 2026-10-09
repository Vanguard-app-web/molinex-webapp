<script setup>
defineProps({
  icon: {type: String, default: 'pi pi-inbox'},
  message: {type: String, required: true}
});
</script>

<template>
  <div class="empty-state" role="status">
    <i :class="icon" aria-hidden="true"></i>
    <p>{{ message }}</p>
    <slot/>
  </div>
</template>

<style scoped>
.empty-state {
  display: grid;
  justify-items: center;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-xl) var(--molinex-space-m);
  text-align: center;
  color: var(--molinex-text-secondary);
}

.empty-state .pi {
  font-size: 1.75rem;
  color: var(--molinex-blue);
}
</style>
