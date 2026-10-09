<script setup>
defineProps({
  eyebrow: {type: String, default: ''},
  title: {type: String, required: true},
  description: {type: String, default: ''}
});
</script>

<template>
  <header class="page-header">
    <div class="page-header-copy">
      <span v-if="eyebrow" class="eyebrow">{{ eyebrow }}</span>
      <h1>{{ title }}</h1>
      <p v-if="description">{{ description }}</p>
    </div>
    <div v-if="$slots.actions" class="page-header-actions">
      <slot name="actions"/>
    </div>
  </header>
</template>

<style scoped>
.page-header {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: var(--molinex-space-m);
}

.page-header-copy {
  display: grid;
  gap: var(--molinex-space-xs);
  max-width: 48rem;
}

.eyebrow {
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--molinex-green-dark);
}

h1 {
  font-size: clamp(1.5rem, 2.5vw, 2rem);
}

h1::after {
  content: '';
  display: block;
  width: 3.5rem;
  height: 0.22rem;
  margin-top: 0.5rem;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--molinex-gold) 0 40%, var(--molinex-green) 40% 70%, var(--molinex-blue) 70%);
}

p {
  color: var(--molinex-text-secondary);
}

.page-header-actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--molinex-space-s);
}
</style>
