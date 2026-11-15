<script setup>
import {computed, nextTick, reactive, ref, shallowRef} from "vue";
import {useI18n} from "vue-i18n";
import {storeToRefs} from "pinia";
import useCommercialStore from "../../application/commercial.store.js";
import {CommercialInquiry} from "../../domain/model/commercial-inquiry.entity.js";
import {ContactInformation} from "../../domain/model/contact-information.js";
import {FullName} from "../../domain/model/full-name.js";
import {EmailAddress} from "../../domain/model/email-address.js";
import {PhoneNumber} from "../../domain/model/phone-number.js";
import {CompanyName} from "../../domain/model/company-name.js";
import {InquiryMessage} from "../../domain/model/inquiry-message.js";
import {useFormatters} from "../../../shared/presentation/composables/use-formatters.js";
import {hasNoErrors, useFormValidation} from "../../../shared/presentation/composables/use-form-validation.js";
import PageHeader from "../../../shared/presentation/components/page-header.vue";
import FormField from "../../../shared/presentation/components/form-field.vue";
import FeedbackMessage from "../../../shared/presentation/components/feedback-message.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const {formatDateTime} = useFormatters();
const store = useCommercialStore();
const {submitting, errors} = storeToRefs(store);
const {submitInquiry, resetInquiry, clearErrors} = store;
const {requiredText} = useFormValidation();

const blankForm = () => ({fullName: '', email: '', phone: '', companyName: '', message: ''});
const form = reactive(blankForm());
const submitted = ref(false);
// Domain entities keep their state in private fields, so they must not be wrapped by Vue's deep reactivity.
const confirmation = shallowRef(null);

const saveErrors = computed(() => errors.value.filter(error => error.operation === 'submit-inquiry'));
const emailError = () => requiredText(form.email) || (EmailAddress.isValid(form.email) ? '' : t('validation.email'));
const phoneError = () => (form.phone.trim() === '' || PhoneNumber.isValid(form.phone) ? '' : t('validation.phone'));
const fieldErrors = computed(() => ({
  fullName: requiredText(form.fullName),
  companyName: requiredText(form.companyName),
  email: emailError(),
  phone: phoneError(),
  message: InquiryMessage.isBlank(form.message) ? t('validation.required') : '',
}));
const errorOf = field => (submitted.value ? fieldErrors.value[field] : '');

clearErrors('submit-inquiry');

/** Builds the draft the visitor typed. The API gives it an id and a submission time. */
function toDraft() {
  return CommercialInquiry.submit({
    contact: new ContactInformation({
      fullName: new FullName(form.fullName),
      email: new EmailAddress(form.email),
      phone: form.phone.trim() === '' ? null : new PhoneNumber(form.phone),
      companyName: new CompanyName(form.companyName),
    }),
    message: new InquiryMessage(form.message),
  });
}

async function send() {
  submitted.value = true;
  if (submitting.value || !hasNoErrors(fieldErrors.value)) return;
  const stored = await submitInquiry(toDraft());
  if (!stored) return;
  confirmation.value = stored;
  Object.assign(form, blankForm());
  submitted.value = false;
  await nextTick();
  document.getElementById('inquiry-confirmation-title')?.focus();
}

function sendAnother() {
  resetInquiry();
  confirmation.value = null;
}
</script>

<template>
  <section class="page">
    <page-header :eyebrow="t('commercial-inquiry-form.eyebrow')" :title="t('commercial-inquiry-form.title')"
                 :description="t('commercial-inquiry-form.description')"/>

    <section v-if="confirmation" class="panel form-panel confirmation" aria-labelledby="inquiry-confirmation-title">
      <i class="pi pi-check-circle" aria-hidden="true"></i>
      <h2 id="inquiry-confirmation-title" tabindex="-1">{{ t('commercial-inquiry-form.received-title') }}</h2>
      <p role="status">{{ t('commercial-inquiry-form.received', {email: confirmation.contact.email.value}) }}</p>
      <dl>
        <div><dt>{{ t('commercial-inquiry-form.reference') }}</dt><dd>{{ confirmation.id.value }}</dd></div>
        <div><dt>{{ t('commercial-inquiry-form.submitted-at') }}</dt><dd>{{ formatDateTime(confirmation.submittedAt.value) }}</dd></div>
      </dl>
      <div class="form-actions">
        <link-button :to="{name: 'commercial-value-proposition'}" :label="t('commercial-inquiry-form.back')" severity="secondary" outlined/>
        <pv-button :label="t('commercial-inquiry-form.send-another')" icon="pi pi-plus" @click="sendAnother"/>
      </div>
    </section>

    <form v-else class="panel form-panel" novalidate @submit.prevent="send">
      <pv-message v-if="submitted && !hasNoErrors(fieldErrors)" severity="warn" class="mb-4">{{ t('forms.review-fields') }}</pv-message>
      <feedback-message :errors="saveErrors" class="mb-4"/>

      <div class="form-grid">
        <form-field id="inquiry-full-name" :label="t('commercial-inquiry-form.full-name')" :error="errorOf('fullName')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="inquiry-full-name" v-model="form.fullName" autocomplete="name" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="inquiry-company" :label="t('commercial-inquiry-form.company')" :error="errorOf('companyName')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="inquiry-company" v-model="form.companyName" autocomplete="organization" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="inquiry-email" :label="t('commercial-inquiry-form.email')" :error="errorOf('email')" required>
          <template #default="{invalid, describedBy}">
            <pv-input-text id="inquiry-email" v-model="form.email" type="email" autocomplete="email" fluid
                           :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
        <form-field id="inquiry-phone" :label="t('commercial-inquiry-form.phone')" :error="errorOf('phone')"
                    :hint="t('commercial-inquiry-form.phone-hint')">
          <template #default="{invalid, describedBy}">
            <pv-input-text id="inquiry-phone" v-model="form.phone" type="tel" autocomplete="tel" fluid
                           :invalid="invalid" :aria-describedby="describedBy"/>
          </template>
        </form-field>
        <form-field id="inquiry-message" :label="t('commercial-inquiry-form.message')" :error="errorOf('message')" required wide>
          <template #default="{invalid, describedBy}">
            <pv-textarea id="inquiry-message" v-model="form.message" rows="6" auto-resize fluid
                         :invalid="invalid" :aria-describedby="describedBy" aria-required="true"/>
          </template>
        </form-field>
      </div>

      <div class="form-actions">
        <link-button :to="{name: 'commercial-value-proposition'}" :label="t('common.cancel')" severity="secondary" outlined/>
        <pv-button type="submit" :label="t(saveErrors.length ? 'commercial-inquiry-form.retry' : 'commercial-inquiry-form.submit')"
                   :icon="saveErrors.length ? 'pi pi-refresh' : 'pi pi-send'" :loading="submitting"/>
      </div>
    </form>
  </section>
</template>

<style scoped>
.confirmation {
  display: grid;
  gap: var(--molinex-space-m);
  justify-items: start;
}

.confirmation > .pi {
  font-size: 2rem;
  color: var(--molinex-success);
}

.confirmation h2:focus {
  outline: none;
}

dl {
  display: grid;
  gap: var(--molinex-space-xs);
  margin: 0;
}

dl div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--molinex-space-s);
}

dt {
  color: var(--molinex-text-secondary);
}

dd {
  margin: 0;
  font-weight: 600;
  overflow-wrap: anywhere;
}
</style>
