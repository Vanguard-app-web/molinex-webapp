<script setup>
import {useAccessControl} from "../../../iam/presentation/composables/use-access-control.js";

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

// A signed-in user is never offered a link to a route the guard would refuse; the guard still
// enforces access when the address is typed in.
const {canOffer} = useAccessControl();
</script>

<template>
  <pv-button v-if="canOffer(to)" as-child v-slot="slotProps" :outlined="outlined" :text="text" :size="size" :severity="severity">
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
