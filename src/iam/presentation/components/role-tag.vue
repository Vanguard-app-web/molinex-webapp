<script setup>
import {computed} from "vue";
import {useI18n} from "vue-i18n";
import {RoleType} from "../../domain/model/role-type.js";

const props = defineProps({
  /** A RoleType. */
  role: {type: String, required: true}
});

const {t} = useI18n();
const appearance = {
  [RoleType.ADMINISTRATOR]: {severity: 'info', icon: 'pi pi-shield'},
  [RoleType.MAINTENANCE_TECHNICIAN]: {severity: 'warn', icon: 'pi pi-wrench'},
  [RoleType.PRODUCTION_OPERATOR]: {severity: 'success', icon: 'pi pi-cog'}
};
const style = computed(() => appearance[props.role] ?? {severity: 'secondary', icon: 'pi pi-question'});
</script>

<template>
  <pv-tag :value="t(`role-type.${role}`)" :severity="style.severity" :icon="style.icon" rounded/>
</template>
