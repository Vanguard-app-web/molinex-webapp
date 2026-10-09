<script setup>
import {useRoute} from "vue-router";
import {useI18n} from "vue-i18n";
import LinkButton from "../components/link-button.vue";

const route = useRoute();
const unavailableRoute = route.path;
const {t} = useI18n();
</script>

<template>
  <section class="not-found panel">
    <span class="code" aria-hidden="true">404</span>
    <h1>{{ t('page-not-found.title') }}</h1>
    <p>{{ t('page-not-found.content', {path: unavailableRoute}) }}</p>
    <link-button :to="{name: 'production-overview'}" :label="t('page-not-found.go-overview')" icon="pi pi-arrow-left"/>
  </section>
</template>

<style scoped>
.not-found {
  display: grid;
  justify-items: center;
  gap: var(--molinex-space-m);
  max-width: 36rem;
  margin: var(--molinex-space-xl) auto;
  text-align: center;
}

.code {
  font-family: var(--molinex-font-heading);
  font-size: 4rem;
  font-weight: 700;
  color: var(--molinex-blue);
  line-height: 1;
}

p {
  color: var(--molinex-text-secondary);
}
</style>
