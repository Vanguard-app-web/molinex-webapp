<script setup>
import {computed} from "vue";

const props = defineProps({
  /** id of the control; the label points to it. */
  id: {type: String, required: true},
  label: {type: String, required: true},
  /** Already translated validation message, or empty when the value is valid. */
  error: {type: String, default: ''},
  hint: {type: String, default: ''},
  required: {type: Boolean, default: false},
  /** Takes the whole row of a two-column form grid. */
  wide: {type: Boolean, default: false}
});

const labelId = computed(() => `${props.id}-label`);
const describedBy = computed(() => props.error ? `${props.id}-error` : (props.hint ? `${props.id}-hint` : undefined));
</script>

<template>
  <div :class="['form-field', {'span-2': wide}]">
    <label :id="labelId" :for="id" class="field-label">
      {{ label }}<span v-if="required" class="required-mark" aria-hidden="true"> *</span>
    </label>
    <slot :described-by="describedBy" :invalid="Boolean(error)" :label-id="labelId"/>
    <small v-if="error" :id="`${id}-error`" class="field-error">
      <i class="pi pi-exclamation-circle" aria-hidden="true"></i> {{ error }}
    </small>
    <small v-else-if="hint" :id="`${id}-hint`" class="field-hint">{{ hint }}</small>
  </div>
</template>

<style scoped>
.form-field {
  display: grid;
  gap: 0.35rem;
  align-content: start;
  min-width: 0;
}

.form-field.span-2 {
  grid-column: 1 / -1;
}

.required-mark {
  color: var(--molinex-critical);
}

.field-error {
  color: var(--molinex-critical);
  font-weight: 500;
}

.field-hint {
  color: var(--molinex-text-secondary);
}
</style>
