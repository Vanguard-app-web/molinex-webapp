<script setup>
import {computed, ref} from "vue";
import {useI18n} from "vue-i18n";
import useIamStore from "../../application/iam.store.js";
import RoleTag from "./role-tag.vue";
import LinkButton from "../../../shared/presentation/components/link-button.vue";

const {t} = useI18n();
const store = useIamStore();
const signingOut = ref(false);

const user = computed(() => store.currentUser);
const displayName = computed(() => user.value?.profile.fullName.value ?? '');

async function signOut() {
  if (signingOut.value) return;
  signingOut.value = true;
  await store.signOut();
  signingOut.value = false;
}
</script>

<template>
  <div class="authentication-section">
    <template v-if="store.isAuthenticated && user">
      <router-link :to="{name: 'iam-profile'}" class="account-link" :title="t('authentication.profile')">
        <i class="pi pi-user" aria-hidden="true"></i>
        <span class="account-copy">
          <span class="account-name">{{ displayName }}</span>
          <role-tag class="account-role" :role="user.role.type"/>
        </span>
        <span class="visually-hidden">{{ t('authentication.profile') }}</span>
      </router-link>
      <pv-button class="sign-out-button" icon="pi pi-sign-out" :label="t('authentication.sign-out')" text size="small"
                 :loading="signingOut" :aria-label="t('authentication.sign-out')" @click="signOut"/>
    </template>
    <template v-else>
      <link-button :to="{name: 'iam-sign-in'}" :label="t('authentication.sign-in')" icon="pi pi-sign-in" size="small"/>
    </template>
  </div>
</template>

<style scoped>
.authentication-section {
  display: flex;
  align-items: center;
  gap: var(--molinex-space-s);
  min-width: 0;
}

.account-link {
  display: inline-flex;
  align-items: center;
  gap: var(--molinex-space-s);
  min-width: 0;
  padding: 0.25rem 0.6rem;
  border: 1px solid var(--molinex-border);
  border-radius: 999px;
  background: var(--molinex-surface);
  color: var(--molinex-text-primary);
  text-decoration: none;
}

.account-link:hover {
  background: var(--molinex-blue-light);
}

.account-link .pi {
  color: var(--molinex-blue);
}

.account-copy {
  display: grid;
  min-width: 0;
  line-height: 1.2;
}

.account-name {
  max-width: 11rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.85rem;
  font-weight: 600;
}

.account-role {
  justify-self: start;
  font-size: 0.65rem;
}

@media (max-width: 720px) {
  .account-copy {
    display: none;
  }

  .sign-out-button :deep(.p-button-label) {
    display: none;
  }
}

/* On phones the sign-in button keeps only its icon; the label stays available to screen readers. */
@media (max-width: 480px) {
  .authentication-section :deep(.link-button span) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
  }
}
</style>
