<script setup>
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import useIamStore from "../../application/iam.store.js";
import {landingRoute} from "../../infrastructure/authentication.guard.js";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const route = useRoute();
const store = useIamStore();
const attemptedPath = typeof route.query.from === 'string' ? route.query.from : '';
</script>

<template>
  <section class="access-denied panel">
    <span class="code" aria-hidden="true">403</span>
    <h1>{{ t('access-denied.title') }}</h1>
    <p>{{ attemptedPath ? t('access-denied.content-path', {path: attemptedPath}) : t('access-denied.content') }}</p>
    <link-button :to="landingRoute(store.currentSession)" :label="t('access-denied.go-back')" icon="pi pi-arrow-left"/>
  </section>
</template>

<style scoped>
.access-denied {
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
  color: var(--molinex-critical);
  line-height: 1;
}

p {
  color: var(--molinex-text-secondary);
}
</style>
