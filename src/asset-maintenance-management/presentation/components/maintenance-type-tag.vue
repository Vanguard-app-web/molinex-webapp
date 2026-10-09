<script setup>
import {useI18n} from "vue-i18n";
import {MaintenanceType} from "../../domain/model/maintenance-type.js";

defineProps({
  type: {type: String, required: true}
});

const {t} = useI18n();
</script>

<template>
  <pv-tag :value="t(`maintenance-type.${type}`)" rounded
          :severity="type === MaintenanceType.CORRECTIVE ? 'danger' : 'info'"
          :icon="type === MaintenanceType.CORRECTIVE ? 'pi pi-wrench' : 'pi pi-calendar'"/>
</template>
