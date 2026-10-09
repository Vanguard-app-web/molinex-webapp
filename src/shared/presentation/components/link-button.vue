<script setup>
defineProps({
  /** Vue Router location. */
  to: {type: [Object, String], required: true},
  label: {type: String, required: true},
  icon: {type: String, default: ''},
  outlined: {type: Boolean, default: false},
  text: {type: Boolean, default: false},
  size: {type: String, default: undefined},
  severity: {type: String, default: undefined}
});
</script>

<template>
  <pv-button as-child v-slot="slotProps" :outlined="outlined" :text="text" :size="size" :severity="severity">
    <router-link :to="to" :class="[slotProps['class'], 'link-button']">
      <i v-if="icon" :class="icon" aria-hidden="true"></i>
      <span>{{ label }}</span>
    </router-link>
  </pv-button>
</template>

<style scoped>
.link-button {
  gap: 0.5rem;
  text-decoration: none;
}
</style>
