<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import LanguageSwitcher from "./language-switcher.vue";

defineEmits(['toggle-navigation']);

const {t, d} = useI18n();
const today = computed(() => d(new Date(), 'today'));
</script>

<template>
  <header class="top-bar">
    <div class="identity">
      <pv-button class="menu-button" icon="pi pi-bars" text rounded
                 :aria-label="t('navigation.open')" @click="$emit('toggle-navigation')"/>
      <div>
        <span class="eyebrow">{{ t('app.name') }}</span>
        <strong>{{ t('app.tagline') }}</strong>
      </div>
    </div>
    <div class="actions">
      <span class="today">
        <i class="pi pi-calendar" aria-hidden="true"></i>
        {{ today }}
      </span>
      <language-switcher/>
    </div>
  </header>
</template>

<style scoped>
.top-bar {
  position: sticky;
  top: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-m);
  min-height: 4.25rem;
  padding: var(--molinex-space-s) clamp(1rem, 3vw, 2.25rem);
  background: rgba(255, 255, 255, 0.95);
  border-bottom: 1px solid var(--molinex-border);
  backdrop-filter: blur(10px);
}

.identity, .actions {
  display: flex;
  align-items: center;
  gap: var(--molinex-space-m);
}

.eyebrow {
  display: block;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--molinex-text-secondary);
}

strong {
  font-family: var(--molinex-font-heading);
  font-size: 1rem;
}

.menu-button {
  display: none;
}

.today {
  display: inline-flex;
  align-items: center;
  gap: var(--molinex-space-s);
  padding: 0.4rem 0.8rem;
  border: 1px solid var(--molinex-border);
  border-radius: 999px;
  background: var(--molinex-background);
  color: var(--molinex-text-secondary);
  font-size: 0.8rem;
}

.today .pi {
  color: var(--molinex-green-dark);
}

@media (max-width: 1023px) {
  .menu-button {
    display: inline-flex;
  }
}

@media (max-width: 720px) {
  .today {
    display: none;
  }
}
</style>
