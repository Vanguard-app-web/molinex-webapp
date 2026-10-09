<script setup>
import {onMounted, watch} from "vue";
import {useI18n} from "vue-i18n";
import {supportedLocales} from "../../../i18n.js";

const STORAGE_KEY = 'molinex.locale';
const {t, locale} = useI18n();

const options = supportedLocales.map(code => ({code, short: code.slice(0, 2).toUpperCase()}));

/** Restores the language chosen in a previous visit, when the browser allows storage. */
onMounted(() => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (supportedLocales.includes(saved)) locale.value = saved;
  } catch {
    // Storage unavailable (private mode or blocked): keep the default language.
  }
});

watch(locale, current => {
  try {
    localStorage.setItem(STORAGE_KEY, current);
  } catch {
    // Storage unavailable: the choice still applies to this visit.
  }
});
</script>

<template>
  <pv-select-button v-model="locale" :options="options" option-label="short" option-value="code"
                    :allow-empty="false" :aria-label="t('language.label')">
    <template #option="{option}">
      <span :lang="option.code" :title="t(`language.names.${option.code}`)">{{ option.short }}</span>
    </template>
  </pv-select-button>
</template>
