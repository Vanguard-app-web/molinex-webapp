<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {MachineStatus} from "../../domain/model/machine-status.js";

const props = defineProps({
  status: {type: String, required: true}
});

const {t} = useI18n();
const appearance = {
  [MachineStatus.OPERATIONAL]: {severity: 'success', icon: 'pi pi-check-circle'},
  [MachineStatus.REQUIRES_ATTENTION]: {severity: 'warn', icon: 'pi pi-exclamation-triangle'},
  [MachineStatus.UNDER_MAINTENANCE]: {severity: 'info', icon: 'pi pi-wrench'},
  [MachineStatus.OUT_OF_SERVICE]: {severity: 'danger', icon: 'pi pi-times-circle'}
};
const style = computed(() => appearance[props.status] ?? {severity: 'secondary', icon: 'pi pi-question'});
</script>

<template>
  <pv-tag :value="t(`machine-status.${status}`)" :severity="style.severity" :icon="style.icon" rounded/>
</template>
