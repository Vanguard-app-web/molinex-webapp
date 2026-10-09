<script setup>
defineProps({
  icon: {type: String, required: true},
  label: {type: String, required: true},
  value: {type: [String, Number], required: true},
  hint: {type: String, default: ''},
  /** Accent color of the icon: blue, green, gold, critical or neutral. */
  tone: {type: String, default: 'blue'}
});
</script>

<template>
  <article class="metric-card">
    <span :class="['metric-icon', `metric-icon--${tone}`]" aria-hidden="true"><i :class="icon"></i></span>
    <div class="metric-copy">
      <span class="metric-label">{{ label }}</span>
      <strong class="metric-value">{{ value }}</strong>
      <small v-if="hint" class="metric-hint">{{ hint }}</small>
    </div>
  </article>
</template>

<style scoped>
.metric-card {
  display: flex;
  align-items: flex-start;
  gap: var(--molinex-space-m);
  padding: var(--molinex-space-m) var(--molinex-space-l);
  background: var(--molinex-surface);
  border: 1px solid var(--molinex-border);
  border-radius: var(--molinex-radius);
  box-shadow: var(--molinex-shadow);
}

.metric-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
}

.metric-icon--blue { background: var(--molinex-blue-light); color: var(--molinex-blue); }
.metric-icon--green { background: var(--molinex-green-light); color: var(--molinex-green-dark); }
.metric-icon--gold { background: var(--molinex-warning-background); color: var(--molinex-gold-dark); }
.metric-icon--critical { background: var(--molinex-critical-background); color: var(--molinex-critical); }
.metric-icon--neutral { background: var(--molinex-neutral-background); color: var(--molinex-neutral); }

.metric-copy {
  display: grid;
  gap: 0.1rem;
  min-width: 0;
}

.metric-label {
  font-size: 0.85rem;
  color: var(--molinex-text-secondary);
}

.metric-value {
  font-family: var(--molinex-font-heading);
  font-size: 1.6rem;
  line-height: 1.2;
}

.metric-hint {
  color: var(--molinex-text-secondary);
}
</style>
