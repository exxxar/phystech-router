<template>
  <div class="d-flex flex-wrap gap-1">
    <span v-for="t in tags" :key="t" class="badge bg-light text-dark border">{{ t }}</span>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'ObjectTags',
  props: { tags: { type: Array as () => string[], default: () => [] } },
});
</script>