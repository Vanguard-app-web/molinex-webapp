<script setup>
import {ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import SideNavigation from "./side-navigation.vue";
import TopBar from "./top-bar.vue";

const {t} = useI18n();
const route = useRoute();
const navigationOpen = ref(false);

// The menu links by path, not by route name, so the shell never depends on how each bounded
// context names its routes and keeps working while a module is still being merged.
const navigationGroups = [
  {
    label: 'navigation.groups.operations',
    items: [
      {label: 'navigation.items.overview',   icon: 'pi pi-home',      to: '/production', exact: true},
      {label: 'navigation.items.receptions', icon: 'pi pi-truck',     to: '/production/receptions'},
      {label: 'navigation.items.batches',    icon: 'pi pi-box',       to: '/production/batches'},
      {label: 'navigation.items.production', icon: 'pi pi-cog',       to: '/production/records'},
      {label: 'navigation.items.history',    icon: 'pi pi-history',   to: '/production/history'}
    ]
  },
  {
    label: 'navigation.groups.quality',
    items: [
      {label: 'navigation.items.quality', icon: 'pi pi-verified',   to: '/quality', exact: true},
      {label: 'navigation.items.waste',   icon: 'pi pi-chart-pie', to: '/quality/waste'}
    ]
  },
  {
    label: 'navigation.groups.assets',
    items: [
      {label: 'navigation.items.machinery',   icon: 'pi pi-server', to: '/assets/machinery'},
      {label: 'navigation.items.maintenance', icon: 'pi pi-wrench', to: '/assets/maintenance'}
    ]
  }
];

watch(() => route.fullPath, () => navigationOpen.value = false);
</script>

<template>
  <a class="skip-link" href="#main-content">{{ t('navigation.skip-to-content') }}</a>
  <pv-toast position="top-right"/>
  <div class="application-shell">
    <aside class="navigation-panel">
      <side-navigation :groups="navigationGroups"/>
    </aside>

    <pv-drawer v-model:visible="navigationOpen" class="navigation-drawer" :header="t('app.name')"
               :close-button-props="{ariaLabel: t('navigation.close')}">
      <side-navigation :groups="navigationGroups" compact/>
    </pv-drawer>

    <div class="application-content">
      <top-bar @toggle-navigation="navigationOpen = !navigationOpen"/>
      <main id="main-content" class="page-content" tabindex="-1">
        <router-view :key="String(route.name)"/>
      </main>
    </div>
  </div>
</template>

<style scoped>
.skip-link {
  position: absolute;
  left: var(--molinex-space-m);
  top: -4rem;
  z-index: 1000;
  background: var(--molinex-surface);
  color: var(--molinex-blue-dark);
  padding: var(--molinex-space-s) var(--molinex-space-m);
  border-radius: var(--molinex-radius);
  font-weight: 600;
}

.skip-link:focus {
  top: var(--molinex-space-m);
}

.application-shell {
  display: grid;
  grid-template-columns: var(--molinex-sidebar-width) minmax(0, 1fr);
  min-height: 100dvh;
}

.navigation-panel {
  position: sticky;
  top: 0;
  height: 100dvh;
  overflow-y: auto;
  background: linear-gradient(180deg, var(--molinex-blue-dark) 0%, var(--molinex-blue) 100%);
}

.application-content {
  min-width: 0;
}

.page-content {
  max-width: 90rem;
  margin: 0 auto;
  padding: clamp(1rem, 3vw, 2.25rem);
}

.page-content:focus {
  outline: none;
}

@media (max-width: 1023px) {
  .application-shell {
    grid-template-columns: minmax(0, 1fr);
  }

  .navigation-panel {
    display: none;
  }
}
</style>

<style>
.navigation-drawer.p-drawer {
  background: linear-gradient(180deg, var(--molinex-blue-dark) 0%, var(--molinex-blue) 100%);
  color: #FFFFFF;
  border: 0;
  width: min(18rem, 86vw);
}

.navigation-drawer .p-drawer-title {
  color: #FFFFFF;
  font-family: var(--molinex-font-heading);
}

.navigation-drawer .p-drawer-close-button {
  color: #FFFFFF;
}

.navigation-drawer .p-drawer-content {
  padding: 0;
}
</style>
