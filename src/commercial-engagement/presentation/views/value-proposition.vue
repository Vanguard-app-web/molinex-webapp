<script setup>
import {computed, onMounted} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useCommercialStore from "../../application/commercial.store.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const store = useCommercialStore();
const {valueProposition, valuePropositionLoaded, errors} = storeToRefs(store);
const {fetchValueProposition, hasErrors} = store;

onMounted(() => {
  if (!valuePropositionLoaded.value) fetchValueProposition();
});

const loadErrors = computed(() => errors.value.filter(error => error.operation === 'fetch-value-proposition'));
const loading = computed(() => !valuePropositionLoaded.value && !hasErrors('fetch-value-proposition'));
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('value-proposition.eyebrow')" :title="t('value-proposition.title')"
                 :description="t('value-proposition.description')">
      <template #actions>
        <link-button :to="{name: 'commercial-plans'}" :label="t('value-proposition.see-plans')" icon="pi pi-list" outlined/>
        <link-button :to="{name: 'commercial-inquiry'}" :label="t('value-proposition.contact')" icon="pi pi-envelope"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchValueProposition()"/>
    <div v-if="loading" role="status" class="secondary-text">{{ t('common.loading') }}</div>

    <section v-else-if="valueProposition" class="panel" aria-labelledby="proposition-headline">
      <h2 id="proposition-headline" class="headline">{{ valueProposition.headline.value }}</h2>

      <template v-if="valueProposition.benefits.length">
        <h3 id="benefits-title" class="benefits-title">{{ t('value-proposition.benefits') }}</h3>
        <ul class="benefits" aria-labelledby="benefits-title">
          <li v-for="(benefit, index) in valueProposition.benefits" :key="`${index}-${benefit}`">
            <i class="pi pi-check-circle" aria-hidden="true"></i>
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </template>
      <empty-state v-else icon="pi pi-star" :message="t('value-proposition.no-benefits')"/>
    </section>
  </section>
</template>

<style scoped>
.headline {
  font-size: clamp(1.25rem, 2.2vw, 1.6rem);
  max-width: 48rem;
}

.benefits-title {
  margin: var(--molinex-space-l) 0 var(--molinex-space-s);
  font-size: 1rem;
}

.benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(16rem, 1fr));
  gap: var(--molinex-space-m);
}

.benefits li {
  display: flex;
  align-items: flex-start;
  gap: var(--molinex-space-s);
  padding: var(--molinex-space-m);
  border: 1px solid var(--molinex-border);
  border-radius: var(--molinex-radius);
  background: var(--molinex-green-light);
}

.benefits .pi {
  color: var(--molinex-green-dark);
  margin-top: 0.2rem;
}
</style>
