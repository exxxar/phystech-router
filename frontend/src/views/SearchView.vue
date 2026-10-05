<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Поиск</h4>
    <SearchInput v-model="filters.query" placeholder="Найти аудиторию, лабораторию или объект" />
    <div class="mt-3"><SearchFilters :filters="filters" @update="filters = $event" /></div>
    <div class="mt-3">
      <Loading v-if="loading" text="Ищем..." />
      <ObjectList v-else :objects="results" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch, onMounted } from 'vue';
import { useSearch } from '@/composables/useSearch';
import SearchInput from '@/components/search/SearchInput.vue';
import SearchFilters from '@/components/search/SearchFilters.vue';
import ObjectList from '@/components/object/ObjectList.vue';
import Loading from '@/components/common/Loading.vue';
import type { SearchFilters as SF } from '@/types';

export default defineComponent({
  name: 'SearchView',
  components: { SearchInput, SearchFilters, ObjectList, Loading },
  setup() {
    const { filters, results, loading, debouncedQuery, search } = useSearch();
    const localFilters = ref<SF>({ query: '' });
    watch(() => localFilters.value, (v) => { filters.value = v; search(); }, { deep: true });
    watch(debouncedQuery, () => search());
    onMounted(search);
    return { filters: localFilters, results, loading };
  },
});
</script>