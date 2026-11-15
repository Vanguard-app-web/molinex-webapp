<script setup>
import {computed, reactive, ref} from "vue";
import {useI18n} from "vue-i18n";
import {useRoute, useRouter} from "vue-router";
import {useToast} from "primevue/usetoast";
import {storeToRefs} from "pinia";
import useIamStore from "../../application/iam.store.js";
import {SignInCommand} from "../../application/sign-in.command.js";
import {EmailAddress} from "../../domain/model/email-address.js";
import {landingRoute, safeRedirectPath} from "../../infrastructure/authentication.guard.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const store = useIamStore();
const {errors} = storeToRefs(store);
const {clearErrors} = store;
const {required} = useFormValidation();

const form = reactive({email: '', password: ''});
const submitted = ref(false);
const signingIn = ref(false);

const reason = computed(() => ['signed-out', 'session-expired'].includes(route.query.reason) ? route.query.reason : null);
const signInErrors = computed(() => errors.value.filter(error => ['sign-in', 'restore-session'].includes(error.operation)));
const fieldErrors = computed(() => ({
  email: required(form.email.trim()) || (EmailAddress.isValid(form.email) ? '' : t('validation.email')),
  password: required(form.password),
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

clearErrors('sign-in');

async function signIn() {
  submitted.value = true;
  if (signingIn.value || !hasNoErrors(fieldErrors.value)) return;
  signingIn.value = true;
  const session = await store.signIn(new SignInCommand({email: form.email, password: form.password}));
  signingIn.value = false;
  if (!session) return;
  toast.add({
    severity: 'success',
    summary: t('sign-in-form.welcome', {name: store.currentUser.profile.fullName.value}),
    life: 4000
  });
  await router.push(safeRedirectPath(route.query.redirect) ?? landingRoute(session));
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('sign-in-form.eyebrow')" :title="t('sign-in-form.title')"
                 :description="t('sign-in-form.description')"/>

    <form class="panel form-panel sign-in-panel" novalidate @submit.prevent="signIn">
      <pv-message v-if="reason" :severity="reason === 'signed-out' ? 'success' : 'warn'" class="mb-4">
        {{ t(`sign-in-form.reasons.${reason}`) }}
      </pv-message>
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="signInErrors" class="mb-4"/>

      <div class="form-grid single-column">
        <form-field id="sign-in-email" :label="t('sign-in-form.email')" :error="errorOf('email')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="sign-in-email" v-model="form.email" type="email" autocomplete="username" fluid
                           :maxlength="EmailAddress.MAX_LENGTH" :invalid="invalid" :aria-describedby="describedBy"
                           aria-required="true"/>
          </template>
        </form-field>
        <form-field id="sign-in-password" :label="t('sign-in-form.password')" :error="errorOf('password')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="sign-in-password" v-model="form.password" type="password" autocomplete="current-password" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'iam-sign-up'}" :label="t('sign-in-form.create-account')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t('sign-in-form.submit')" icon="pi pi-sign-in" :loading="signingIn"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.sign-in-panel {
  max-width: 30rem;
}

.single-column {
  grid-template-columns: minmax(0, 1fr);
}
</style>
