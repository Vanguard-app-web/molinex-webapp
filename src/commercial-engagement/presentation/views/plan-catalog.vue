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
const {plans, plansLoaded, errors} = storeToRefs(store);
const {fetchPlans, hasErrors} = store;

onMounted(() => {
  if (!plansLoaded.value) fetchPlans();
});

const loadErrors = computed(() => errors.value.filter(error => error.operation === 'fetch-plans'));
const loading = computed(() => !plansLoaded.value && !hasErrors('fetch-plans'));
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('plan-catalog.eyebrow')" :title="t('plan-catalog.title')" :description="t('plan-catalog.description')">
      <template #actions>
        <link-button :to="{name: 'commercial-value-proposition'}" :label="t('plan-catalog.value-proposition')" icon="pi pi-star" outlined/>
        <link-button :to="{name: 'commercial-inquiry'}" :label="t('plan-catalog.contact')" icon="pi pi-envelope"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchPlans()"/>
    <div v-if="loading" role="status" class="secondary-text">{{ t('common.loading') }}</div>

    <section v-else-if="plansLoaded" aria-labelledby="plans-title">
      <h2 id="plans-title" class="visually-hidden">{{ t('plan-catalog.title') }}</h2>
      <ul v-if="plans.length" class="plan-grid">
        <li v-for="plan in plans" :key="plan.id.value" class="plan-card">
          <h3>{{ plan.name.value }}</h3>
          <p class="price">{{ plan.price.value }}</p>
          <ul v-if="plan.features.length" class="features" :aria-label="t('plan-catalog.features', {plan: plan.name.value})">
            <li v-for="(feature, index) in plan.features" :key="`${index}-${feature}`">
              <i class="pi pi-check" aria-hidden="true"></i>
              <span>{{ feature }}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div v-else class="panel">
        <empty-state icon="pi pi-list" :message="t('plan-catalog.empty')">
          <link-button :to="{name: 'commercial-inquiry'}" :label="t('plan-catalog.contact')" icon="pi pi-envelope"/>
        </empty-state>
      </div>
    </section>
  </section>
</template>

<style scoped>
.plan-grid {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(17rem, 1fr));
  gap: var(--molinex-space-m);
}

.plan-card {
  display: grid;
  gap: var(--molinex-space-s);
  align-content: start;
  padding: var(--molinex-space-l);
  background: var(--molinex-surface);
  border: 1px solid var(--molinex-border);
  border-top: 0.25rem solid var(--molinex-blue);
  border-radius: var(--molinex-radius);
  box-shadow: var(--molinex-shadow);
}

.plan-card h3 {
  font-size: 1.15rem;
}

.price {
  font-family: var(--molinex-font-heading);
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--molinex-blue);
}

.features {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: var(--molinex-space-xs);
}

.features li {
  display: flex;
  align-items: flex-start;
  gap: var(--molinex-space-s);
  font-size: 0.9rem;
}

.features .pi {
  color: var(--molinex-green-dark);
  margin-top: 0.2rem;
}
</style>
