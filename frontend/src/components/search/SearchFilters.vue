<template>
  <div class="d-flex flex-wrap gap-2">
    <select class="form-select form-select-sm" style="max-width: 160px;" :value="filters.floor" @change="update('floor', +($event.target as HTMLSelectElement).value || undefined)">
      <option :value="undefined">Все этажи</option>
      <option v-for="n in [1,2,3,4]" :key="n" :value="n">{{ n }} этаж</option>
    </select>
    <select class="form-select form-select-sm" style="max-width: 180px;" :value="filters.type" @change="update('type', ($event.target as HTMLSelectElement).value || undefined)">
      <option :value="undefined">Все типы</option>
      <option value="classroom">Аудитория</option>
      <option value="lab">Лаборатория</option>
      <option value="office">Кабинет</option>
      <option value="department">Кафедра</option>
    </select>
    <select class="form-select form-select-sm" style="max-width: 180px;" :value="filters.accessible" @change="update('accessible', ($event.target as HTMLSelectElement).value === '' ? undefined : ($event.target as HTMLSelectElement).value === 'true')">
      <option :value="undefined">Доступность</option>
      <option :value="true">Доступно</option>
      <option :value="false">Недоступно</option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import type { SearchFilters } from '@/types';
export default defineComponent({
  name: 'SearchFilters',
  props: { filters: { type: Object as () => SearchFilters, required: true } },
  emits: ['update'],
  setup(props, { emit }) {
    function update<K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) {
      emit('update', { ...props.filters, [key]: value });
    }
    return { update };
  },
});
</script>