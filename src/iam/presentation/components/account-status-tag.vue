<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {AccountStatus} from "../../domain/model/account-status.js";

const props = defineProps({
  /** An AccountStatus. */
  status: {type: String, required: true}
});

const {t} = useI18n();
const appearance = {
  [AccountStatus.ACTIVE]: {severity: 'success', icon: 'pi pi-check-circle'},
  [AccountStatus.INACTIVE]: {severity: 'secondary', icon: 'pi pi-minus-circle'},
  [AccountStatus.LOCKED]: {severity: 'danger', icon: 'pi pi-lock'}
};
const style = computed(() => appearance[props.status] ?? {severity: 'secondary', icon: 'pi pi-question'});
</script>

<template>
  <pv-tag :value="t(`account-status.${status}`)" :severity="style.severity" :icon="style.icon" rounded/>
</template>
