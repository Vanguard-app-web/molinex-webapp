<script setup>
import {computed, onMounted, ref} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useIamStore from "../../application/iam.store.js";
import {AccountStatus} from "../../domain/model/account-status.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import MetricCard from "../../../shared/presentation/components/metric-card.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import RoleTag from "../components/role-tag.vue";
import AccountStatusTag from "../components/account-status-tag.vue";

const {t} = useI18n();
const store = useIamStore();
const {users, errors, usersLoaded} = storeToRefs(store);
const {fetchUsers, hasErrors} = store;
const search = ref('');

onMounted(() => {
  if (!usersLoaded.value) fetchUsers();
});

const loadErrors = computed(() => errors.value.filter(error => error.operation === 'fetch-users'));
const rows = computed(() => users.value.map(user => ({
  id: user.id.value,
  fullName: user.profile.fullName.value,
  email: user.email.value,
  jobTitle: user.profile.jobTitle.value,
  role: user.role.type,
  status: user.status,
})));
const filteredRows = computed(() => {
  const term = search.value.trim().toLowerCase();
  if (!term) return rows.value;
  return rows.value.filter(row => [row.fullName, row.email, row.jobTitle, t(`role-type.${row.role}`), t(`account-status.${row.status}`)]
      .some(value => value.toLowerCase().includes(term)));
});
const activeCount = computed(() => rows.value.filter(row => row.status === AccountStatus.ACTIVE).length);
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('user-list.eyebrow')" :title="t('user-list.title')" :description="t('user-list.description')">
      <template #actions>
        <link-button :to="{name: 'iam-user-new'}" :label="t('user-list.new')" icon="pi pi-user-plus"/>
      </template>
    </page-header>

    <feedback-message :errors="loadErrors" retryable @retry="fetchUsers()"/>

    <div class="metrics-grid">
      <metric-card icon="pi pi-users" :label="t('user-list.metrics.total')" :value="rows.length"/>
      <metric-card icon="pi pi-check-circle" tone="green" :label="t('user-list.metrics.active')" :value="activeCount"/>
      <metric-card icon="pi pi-lock" tone="neutral" :label="t('user-list.metrics.not-active')" :value="rows.length - activeCount"/>
    </div>

    <section class="panel" aria-labelledby="users-table-title">
      <div class="panel-heading">
        <div>
          <h2 id="users-table-title">{{ t('user-list.table-title') }}</h2>
          <p class="panel-subtitle" aria-live="polite">{{ t('common.results', {count: filteredRows.length}) }}</p>
        </div>
        <pv-icon-field>
          <pv-input-icon class="pi pi-search"/>
          <pv-input-text v-model="search" type="search" :placeholder="t('user-list.search')" :aria-label="t('user-list.search')"/>
        </pv-icon-field>
      </div>

      <pv-data-table :value="filteredRows" data-key="id" paginator :rows="10" :rows-per-page-options="[5, 10, 20]"
                     sort-field="fullName" :sort-order="1" striped-rows table-style="min-width: 52rem"
                     :loading="!usersLoaded && !hasErrors('fetch-users')">
        <template #empty>
          <empty-state icon="pi pi-users" :message="loadErrors.length ? t('common.unavailable') : search ? t('common.no-results') : t('user-list.empty')"/>
        </template>
        <pv-column field="fullName" :header="t('user-list.columns.name')" sortable>
          <template #body="{data}">
            <div class="cell-stack">
              <strong>{{ data.fullName }}</strong>
              <small>{{ data.email }}</small>
            </div>
          </template>
        </pv-column>
        <pv-column field="jobTitle" :header="t('user-list.columns.job-title')" sortable>
          <template #body="{data}">{{ data.jobTitle || '—' }}</template>
        </pv-column>
        <pv-column field="role" :header="t('user-list.columns.role')" sortable>
          <template #body="{data}"><role-tag :role="data.role"/></template>
        </pv-column>
        <pv-column field="status" :header="t('user-list.columns.status')" sortable>
          <template #body="{data}"><account-status-tag :status="data.status"/></template>
        </pv-column>
        <pv-column :header="t('common.actions')">
          <template #body="{data}">
            <div class="row-actions">
              <link-button :to="{name: 'iam-user-edit', params: {id: data.id}}"
                           :label="t('user-list.edit')" icon="pi pi-pencil" text size="small"/>
              <link-button :to="{name: 'iam-user-role', params: {id: data.id}}"
                           :label="t('user-list.assign-role')" icon="pi pi-shield" text size="small"/>
            </div>
          </template>
        </pv-column>
      </pv-data-table>
    </section>
  </section>
</template>
