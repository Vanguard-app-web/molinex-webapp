<script setup>
import {computed, onMounted, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useIamStore from "../../application/iam.store.js";
import {Role} from "../../domain/model/role.js";
import {roleTypes} from "../../domain/model/role-type.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import PermissionList from "../components/permission-list.vue";
import RoleTag from "../components/role-tag.vue";
import AccountStatusTag from "../components/account-status-tag.vue";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useIamStore();
const {errors, usersLoaded} = storeToRefs(store);
const {fetchUsers, userById, assignRole, clearErrors} = store;

const selectedType = ref(null);
const saving = ref(false);

const user = computed(() => userById(route.params.id));
const loadErrors = computed(() => errors.value.filter(error => error.operation === 'fetch-users'));
const saveErrors = computed(() => errors.value.filter(error => error.operation === 'assign-role'));
const loading = computed(() => !usersLoaded.value && loadErrors.value.length === 0);
const missing = computed(() => usersLoaded.value && !user.value);
const roleOptions = computed(() => roleTypes.map(type => ({value: type, label: t(`role-type.${type}`)})));
const selectedRole = computed(() => (selectedType.value ? Role.of(selectedType.value) : null));
const unchanged = computed(() => selectedType.value === user.value?.role.type);

onMounted(async () => {
  clearErrors('assign-role');
  if (!usersLoaded.value) await fetchUsers();
  if (user.value) selectedType.value = user.value.role.type;
});

watch(user, (current, previous) => {
  if (current && !previous) selectedType.value = current.role.type;
});

async function save() {
  if (saving.value || !selectedRole.value || unchanged.value) return;
  saving.value = true;
  const updated = await assignRole(user.value.id, selectedRole.value);
  saving.value = false;
  if (!updated) return;
  toast.add({
    severity: 'success',
    summary: t('role-assignment-form.assigned', {name: updated.profile.fullName.value, role: t(`role-type.${updated.role.type}`)}),
    life: 4000
  });
  await router.push({name: 'iam-users'});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('role-assignment-form.eyebrow')" :title="t('role-assignment-form.title')"
                 :description="t('role-assignment-form.description')"/>

    <feedback-message :errors="loadErrors" retryable @retry="fetchUsers()"/>
    <div v-if="loading" role="status" class="secondary-text">{{ t('common.loading') }}</div>
    <empty-state v-else-if="missing" icon="pi pi-user" :message="t('api-errors.user-not-found')">
      <link-button :to="{name: 'iam-users'}" :label="t('user-form.back-to-users')" icon="pi pi-arrow-left" outlined/>
    </empty-state>

    <form v-else-if="user" class="panel form-panel" novalidate @submit.prevent="save">
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="context-card mb-4">
        <i class="pi pi-user" aria-hidden="true"></i>
        <div>
          <strong>{{ user.profile.fullName.value }}</strong>
          <small>{{ user.email.value }}</small>
        </div>
        <role-tag :role="user.role.type"/>
        <account-status-tag :status="user.status"/>
      </div>

      <div class="form-grid">
        <form-field id="assigned-role" :label="t('role-assignment-form.role')" required wide>
          <template #default="{labelId}">
            <pv-select v-model="selectedType" input-id="assigned-role" :options="roleOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
        <div class="span-2 role-summary" role="group" aria-labelledby="assigned-role-permissions">
          <p id="assigned-role-permissions" class="field-label">{{ t('role-assignment-form.permissions') }}</p>
          <permission-list v-if="selectedRole" :permissions="selectedRole.permissions" labelled-by="assigned-role-permissions"/>
        </div>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'iam-users'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('role-assignment-form.save')" icon="pi pi-check" :loading="saving" :disabled="unchanged"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.role-summary {
  padding: var(--molinex-space-m);
  border: 1px solid var(--molinex-border);
  border-radius: var(--molinex-radius);
  background: var(--molinex-blue-light);
}

.context-card {
  flex-wrap: wrap;
}
</style>
