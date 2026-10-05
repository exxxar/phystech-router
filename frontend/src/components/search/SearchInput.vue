<template>
  <div class="input-group">
    <span class="input-group-text bg-white"><i class="bi bi-search text-muted"></i></span>
    <input
        type="text" class="form-control form-control-lg"
        :placeholder="placeholder"
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <button v-if="modelValue" class="btn btn-outline-secondary" @click="$emit('update:modelValue', '')">
      <i class="bi bi-x"></i>
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({
  name: 'SearchInput',
  props: { modelValue: String, placeholder: { type: String, default: 'Поиск...' } },
  emits: ['update:modelValue'],
});
</script>