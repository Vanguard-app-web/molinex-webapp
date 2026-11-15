<script setup>
import {computed, onMounted, reactive, ref, watch} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useIamStore from "../../application/iam.store.js";
import {SignUpCommand} from "../../application/sign-up.command.js";
import {RegisterUserCommand} from "../../application/register-user.command.js";
import {MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH} from "../../application/password-policy.js";
import {EmailAddress} from "../../domain/model/email-address.js";
import {FullName} from "../../domain/model/full-name.js";
import {JobTitle} from "../../domain/model/job-title.js";
import {PhoneNumber} from "../../domain/model/phone-number.js";
import {UserProfile} from "../../domain/model/user-profile.js";
import {Role} from "../../domain/model/role.js";
import {RoleType, roleTypes} from "../../domain/model/role-type.js";
import {DEFAULT_SIGN_UP_ROLE} from "../../domain/model/role-permissions.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import EmptyState from "../../../shared/presentation/components/empty-state.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";
import PermissionList from "../components/permission-list.vue";

const props = defineProps({
  /** 'sign-up' (public registration), 'create' (administrator registers a user) or 'edit' (administrator edits a profile). */
  mode: {type: String, default: 'sign-up', validator: value => ['sign-up', 'create', 'edit'].includes(value)}
});

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useIamStore();
const {errors, usersLoaded} = storeToRefs(store);
const {fetchUsers, userById, clearErrors, signUp, registerUser, updateProfile} = store;
const {requiredText, optionalText} = useFormValidation();

const isSignUp = props.mode === 'sign-up';
const isEdit = props.mode === 'edit';
const operation = isSignUp ? 'sign-up' : (isEdit ? 'update-profile' : 'register-user');

const form = reactive({email: '', password: '', fullName: '', jobTitle: '', phoneNumber: '', role: RoleType.PRODUCTION_OPERATOR});
const submitted = ref(false);
const saving = ref(false);
const userToEdit = computed(() => (isEdit ? userById(route.params.id) : null));
const saveErrors = computed(() => errors.value.filter(error => error.operation === operation));
const loadErrors = computed(() => errors.value.filter(error => error.operation === 'fetch-users'));
const roleOptions = computed(() => roleTypes.map(type => ({value: type, label: t(`role-type.${type}`)})));
const selectedRole = computed(() => Role.of(form.role));
const loadingUser = computed(() => isEdit && !usersLoaded.value && loadErrors.value.length === 0);
const userMissing = computed(() => isEdit && usersLoaded.value && !userToEdit.value);

const passwordError = () => {
  if (!form.password) return t('validation.required');
  if (form.password.length < MIN_PASSWORD_LENGTH) return t('validation.password-min', {min: MIN_PASSWORD_LENGTH});
  return form.password.length > MAX_PASSWORD_LENGTH ? t('validation.max-length', {max: MAX_PASSWORD_LENGTH}) : '';
};
const phoneError = () => (form.phoneNumber.trim() === '' || PhoneNumber.isValid(form.phoneNumber) ? '' : t('validation.phone'));
const emailError = () => requiredText(form.email, EmailAddress.MAX_LENGTH) || (EmailAddress.isValid(form.email) ? '' : t('validation.email'));

const fieldErrors = computed(() => ({
  ...(isEdit ? {} : {email: emailError(), password: passwordError()}),
  fullName: requiredText(form.fullName, FullName.MAX_LENGTH),
  ...(isSignUp ? {} : {
    jobTitle: optionalText(form.jobTitle, JobTitle.MAX_LENGTH),
    phoneNumber: phoneError(),
  }),
}));
const errorOf = field => (submitted.value ? (fieldErrors.value[field] ?? '') : '');

function fillFrom(user) {
  form.email = user.email.value;
  form.fullName = user.profile.fullName.value;
  form.jobTitle = user.profile.jobTitle.value;
  form.phoneNumber = user.profile.phoneNumber.value;
}

onMounted(async () => {
  clearErrors(operation);
  if (!isEdit) return;
  if (!usersLoaded.value) await fetchUsers();
  if (userToEdit.value) fillFrom(userToEdit.value);
});

watch(userToEdit, (user, previous) => {
  if (user && !previous) fillFrom(user);
});

async function save() {
  submitted.value = true;
  if (saving.value || !hasNoErrors(fieldErrors.value)) return;
  saving.value = true;
  try {
    if (isSignUp) {
      const created = await signUp(new SignUpCommand({email: form.email, password: form.password, fullName: form.fullName}));
      if (!created) return;
      toast.add({severity: 'success', summary: t('user-form.account-created', {email: created.email.value}), life: 6000});
      await router.push({name: 'iam-sign-in'});
    } else if (isEdit) {
      const profile = new UserProfile({
        fullName: new FullName(form.fullName),
        jobTitle: new JobTitle(form.jobTitle),
        phoneNumber: new PhoneNumber(form.phoneNumber),
      });
      const updated = await updateProfile(userToEdit.value.id, profile);
      if (!updated) return;
      toast.add({severity: 'success', summary: t('user-form.updated', {name: updated.profile.fullName.value}), life: 4000});
      await router.push({name: 'iam-users'});
    } else {
      const created = await registerUser(new RegisterUserCommand({
        email: form.email, password: form.password, fullName: form.fullName,
        jobTitle: form.jobTitle, phoneNumber: form.phoneNumber, role: form.role,
      }));
      if (!created) return;
      toast.add({severity: 'success', summary: t('user-form.registered', {name: created.profile.fullName.value}), life: 4000});
      await router.push({name: 'iam-users'});
    }
  } finally {
    saving.value = false;
  }
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t(isSignUp ? 'user-form.eyebrow-sign-up' : 'user-form.eyebrow')"
                 :title="t(`user-form.title-${mode}`)" :description="t(`user-form.description-${mode}`)"/>

    <feedback-message v-if="isEdit" :errors="loadErrors" retryable @retry="fetchUsers()"/>
    <div v-if="loadingUser" role="status" class="secondary-text">{{ t('common.loading') }}</div>
    <empty-state v-else-if="userMissing" icon="pi pi-user" :message="t('api-errors.user-not-found')">
      <link-button :to="{name: 'iam-users'}" :label="t('user-form.back-to-users')" icon="pi pi-arrow-left" outlined/>
    </empty-state>

    <form v-else-if="!isEdit || userToEdit" class="panel form-panel" novalidate @submit.prevent="save">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="user-full-name" :label="t('user-form.full-name')" :error="errorOf('fullName')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="user-full-name" v-model="form.fullName" :maxlength="FullName.MAX_LENGTH" autocomplete="name" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>

        <form-field id="user-email" :label="t('user-form.email')" :error="errorOf('email')" required
                    :hint="isEdit ? t('user-form.email-fixed') : ''">
          <template #default="{invalid, describedBy}">
            <pv-input-text id="user-email" v-model="form.email" type="email" :readonly="isEdit" :maxlength="EmailAddress.MAX_LENGTH"
                           :autocomplete="isSignUp ? 'username' : 'off'" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>

        <form-field v-if="!isEdit" id="user-password" :label="t('user-form.password')" :error="errorOf('password')"
                    :hint="t('user-form.password-hint', {min: MIN_PASSWORD_LENGTH})" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="user-password" v-model="form.password" type="password" autocomplete="new-password" fluid
                           :maxlength="MAX_PASSWORD_LENGTH" :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>

        <template v-if="!isSignUp">
          <form-field id="user-job-title" :label="t('user-form.job-title')" :error="errorOf('jobTitle')">
            <template #default="{invalid, describedBy}">
              <pv-input-text id="user-job-title" v-model="form.jobTitle" :maxlength="JobTitle.MAX_LENGTH" autocomplete="organization-title" fluid
                             :invalid="invalid" :aria-describedby="describedBy"/>
            </template>
          </form-field>
          <form-field id="user-phone" :label="t('user-form.phone')" :error="errorOf('phoneNumber')" :hint="t('user-form.phone-hint')">
            <template #default="{invalid, describedBy}">
              <pv-input-text id="user-phone" v-model="form.phoneNumber" type="tel" autocomplete="tel" fluid
                             :invalid="invalid" :aria-describedby="describedBy"/>
            </template>
          </form-field>
        </template>

        <form-field v-if="mode === 'create'" id="user-role" :label="t('user-form.role')" required wide>
          <template #default="{labelId}">
            <pv-select v-model="form.role" input-id="user-role" :options="roleOptions" option-label="label" option-value="value" fluid
                       :aria-labelledby="labelId"/>
          </template>
        </form-field>
        <div v-if="mode === 'create'" class="span-2 role-summary" role="group" aria-labelledby="user-role-permissions">
          <p id="user-role-permissions" class="field-label">{{ t('user-form.role-permissions') }}</p>
          <permission-list :permissions="selectedRole.permissions" labelled-by="user-role-permissions"/>
        </div>

        <p v-if="isSignUp" class="span-2 secondary-text">
          {{ t('user-form.sign-up-role-note', {role: t(`role-type.${DEFAULT_SIGN_UP_ROLE}`)}) }}
        </p>
      </div>

      <div class="form-actions">
        <link-button :to="isSignUp ? {name: 'iam-sign-in'} : {name: 'iam-users'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t(`user-form.save-${mode}`)" icon="pi pi-check" :loading="saving"/>
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
</style>
