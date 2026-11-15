<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useIamStore from "../../application/iam.store.js";
import {FullName} from "../../domain/model/full-name.js";
import {JobTitle} from "../../domain/model/job-title.js";
import {PhoneNumber} from "../../domain/model/phone-number.js";
import {UserProfile} from "../../domain/model/user-profile.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import PermissionList from "../components/permission-list.vue";
import RoleTag from "../components/role-tag.vue";
import AccountStatusTag from "../components/account-status-tag.vue";

const {t} = useI18n();
const toast = useToast();
const store = useIamStore();
const {currentUser, errors} = storeToRefs(store);
const {updateProfile, clearErrors} = store;
const {requiredText, optionalText} = useFormValidation();

const form = reactive({fullName: '', jobTitle: '', phoneNumber: ''});
const submitted = ref(false);
const saving = ref(false);

const saveErrors = computed(() => errors.value.filter(error => error.operation === 'update-profile'));
const phoneError = () => (form.phoneNumber.trim() === '' || PhoneNumber.isValid(form.phoneNumber) ? '' : t('validation.phone'));
const fieldErrors = computed(() => ({
  fullName: requiredText(form.fullName, FullName.MAX_LENGTH),
  jobTitle: optionalText(form.jobTitle, JobTitle.MAX_LENGTH),
  phoneNumber: phoneError(),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

function fillFrom(user) {
  form.fullName = user.profile.fullName.value;
  form.jobTitle = user.profile.jobTitle.value;
  form.phoneNumber = user.profile.phoneNumber.value;
}

onMounted(() => {
  clearErrors('update-profile');
  if (currentUser.value) fillFrom(currentUser.value);
});

watch(currentUser, (user, previous) => {
  if (user && !previous) fillFrom(user);
});

async function save() {
  submitted.value = true;
  if (saving.value || !hasNoErrors(fieldErrors.value)) return;
  saving.value = true;
  const updated = await updateProfile(currentUser.value.id, new UserProfile({
    fullName: new FullName(form.fullName),
    jobTitle: new JobTitle(form.jobTitle),
    phoneNumber: new PhoneNumber(form.phoneNumber),
  }));
  saving.value = false;
  if (!updated) return;
  fillFrom(updated);
  submitted.value = false;
  toast.add({severity: 'success', summary: t('profile-view.saved'), life: 4000});
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('profile-view.eyebrow')" :title="t('profile-view.title')" :description="t('profile-view.description')"/>

    <div v-if="!currentUser" role="status" class="secondary-text">{{ t('common.loading') }}</div>
    <template v-else>
      <section class="panel account-panel" aria-labelledby="account-title">
        <h2 id="account-title">{{ t('profile-view.account') }}</h2>
        <dl>
          <div><dt>{{ t('profile-view.email') }}</dt><dd>{{ currentUser.email.value }}</dd></div>
          <div><dt>{{ t('profile-view.role') }}</dt><dd><role-tag :role="currentUser.role.type"/></dd></div>
          <div><dt>{{ t('profile-view.status') }}</dt><dd><account-status-tag :status="currentUser.status"/></dd></div>
        </dl>
        <div role="group" aria-labelledby="profile-permissions-title">
          <p id="profile-permissions-title" class="field-label">{{ t('profile-view.permissions') }}</p>
          <permission-list :permissions="currentUser.role.permissions" labelled-by="profile-permissions-title"/>
        </div>
        <p class="secondary-text">{{ t('profile-view.privileges-note') }}</p>
      </section>

      <form class="panel form-panel" novalidate @submit.prevent="save">
        <h2 class="form-title">{{ t('profile-view.personal-information') }}</h2>
        <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
        <feedback-message :errors="saveErrors" class="mb-4"/>

        <div class="form-grid">
          <form-field id="profile-full-name" :label="t('user-form.full-name')" :error="errorOf('fullName')" required wide>
            <template #default="{invalid, describedBy}">
              <pv-input-text id="profile-full-name" v-model="form.fullName" :maxlength="FullName.MAX_LENGTH" autocomplete="name" fluid
                             :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
            </template>
          </form-field>
          <form-field id="profile-job-title" :label="t('user-form.job-title')" :error="errorOf('jobTitle')">
            <template #default="{invalid, describedBy}">
              <pv-input-text id="profile-job-title" v-model="form.jobTitle" :maxlength="JobTitle.MAX_LENGTH" autocomplete="organization-title" fluid
                             :invalid="invalid" :aria-describedby="describedBy"/>
            </template>
          </form-field>
          <form-field id="profile-phone" :label="t('user-form.phone')" :error="errorOf('phoneNumber')" :hint="t('user-form.phone-hint')">
            <template #default="{invalid, describedBy}">
              <pv-input-text id="profile-phone" v-model="form.phoneNumber" type="tel" autocomplete="tel" fluid
                             :invalid="invalid" :aria-describedby="describedBy"/>
            </template>
          </form-field>
        </div>

        <div class="form-actions">
          <pv-button type="submit" :label="t('profile-view.save')" icon="pi pi-check" :loading="saving"/>
        </div>
      </form>
    </template>
  </section>
</template>

<style scoped>
.account-panel {
  display: grid;
  gap: var(--molinex-space-m);
  max-width: 52rem;
}

.account-panel h2, .form-title {
  font-size: 1.125rem;
  margin-bottom: var(--molinex-space-m);
}

.account-panel h2 {
  margin-bottom: 0;
}

dl {
  display: grid;
  gap: var(--molinex-space-s);
  margin: 0;
}

dl div {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--molinex-space-s);
  font-size: 0.9rem;
}

dt {
  color: var(--molinex-text-secondary);
}

dd {
  margin: 0;
}
</style>
