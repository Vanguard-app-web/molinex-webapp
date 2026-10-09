<script setup>
import {useI18n} from "vue-i18n";

defineProps({
  /** @type {{label: string, items: {label: string, icon: string, to: object, exact?: boolean}[]}[]} */
  groups: {type: Array, required: true},
  /** Hides the brand block, used inside the mobile drawer that already shows it as header. */
  compact: {type: Boolean, default: false}
});

const {t} = useI18n();
</script>

<template>
  <div class="side-navigation">
    <div v-if="!compact" class="brand">
      <div class="brand-logo">
        <img src="/molinex-logo.png" alt="Molinex"/>
      </div>
      <span class="brand-tagline">{{ t('app.tagline') }}</span>
    </div>

    <nav class="navigation" :aria-label="t('navigation.main')">
      <section v-for="group in groups" :key="group.label" class="navigation-group" :aria-label="t(group.label)">
        <p class="navigation-group-label" aria-hidden="true">{{ t(group.label) }}</p>
        <ul>
          <li v-for="item in group.items" :key="item.label">
            <router-link :to="item.to" custom v-slot="{href, navigate, isActive, isExactActive}">
              <a :href="href" @click="navigate"
                 :class="['navigation-item', {'navigation-item--active': item.exact ? isExactActive : isActive}]"
                 :aria-current="(item.exact ? isExactActive : isActive) ? 'page' : undefined">
                <i :class="item.icon" aria-hidden="true"></i>
                <span>{{ t(item.label) }}</span>
              </a>
            </router-link>
          </li>
        </ul>
      </section>
    </nav>
  </div>
</template>

<style scoped>
.side-navigation {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  padding: var(--molinex-space-l) var(--molinex-space-m);
  color: #FFFFFF;
}

.brand {
  padding-bottom: var(--molinex-space-l);
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}

.brand-logo {
  background: #FFFFFF;
  border-radius: var(--molinex-radius);
  padding: var(--molinex-space-s) var(--molinex-space-m);
}

.brand-logo img {
  max-height: 2.25rem;
  margin: 0 auto;
}

.brand-tagline {
  display: block;
  margin-top: var(--molinex-space-s);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.78);
}

.navigation {
  display: grid;
  gap: var(--molinex-space-l);
  padding-top: var(--molinex-space-l);
}

.navigation-group ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
}

.navigation-group-label {
  font-family: var(--molinex-font-heading);
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.7);
  margin: 0 0 var(--molinex-space-s) var(--molinex-space-s);
}

.navigation-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 2.75rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.6rem;
  color: rgba(255, 255, 255, 0.88);
  font-family: var(--molinex-font-heading);
  font-size: 0.9rem;
  font-weight: 500;
  text-decoration: none;
  transition: background-color 150ms ease;
}

.navigation-item:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #FFFFFF;
}

.navigation-item:focus-visible {
  outline: 3px solid var(--molinex-gold);
  outline-offset: 1px;
}

.navigation-item--active {
  background: rgba(255, 255, 255, 0.16);
  box-shadow: inset 0.25rem 0 var(--molinex-gold);
  color: #FFFFFF;
  font-weight: 700;
}
</style>
