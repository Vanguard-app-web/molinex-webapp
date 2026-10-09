<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {ProductionStatus} from "../../domain/model/production-status.js";

const props = defineProps({
  status: {type: String, required: true}
});

const {t} = useI18n();
const appearance = {
  [ProductionStatus.REGISTERED]: {severity: 'info', icon: 'pi pi-flag'},
  [ProductionStatus.IN_PROGRESS]: {severity: 'warn', icon: 'pi pi-clock'},
  [ProductionStatus.COMPLETED]: {severity: 'success', icon: 'pi pi-check-circle'}
};
const style = computed(() => appearance[props.status] ?? {severity: 'secondary', icon: 'pi pi-question'});
</script>

<template>
  <pv-tag :value="t(`production-status.${status}`)" :severity="style.severity" :icon="style.icon" rounded/>
</template>
