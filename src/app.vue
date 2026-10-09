<script setup>
import {watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute} from "vue-router";
import {usePrimeVue} from "primevue/config";
import Layout from "./shared/presentation/components/layout.vue";
import {updateDocumentTitle} from "./router.js";

const {locale, getLocaleMessage} = useI18n();
const route = useRoute();
const primevue = usePrimeVue();
const englishPrimeVueLocale = JSON.parse(JSON.stringify(primevue.config.locale));

/** Keeps the html lang attribute, the tab title and the PrimeVue texts in the selected language. */
watch(locale, current => {
  document.documentElement.lang = current;
  updateDocumentTitle(route);
  const translations = getLocaleMessage(current)["primevue"] ?? {};
  primevue.config.locale = {
    ...englishPrimeVueLocale,
    ...translations,
    aria: {...englishPrimeVueLocale.aria, ...(translations.aria ?? {})}
  };
}, {immediate: true});
</script>

<template>
  <layout/>
</template>
