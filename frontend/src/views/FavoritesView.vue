<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Избранное</h4>
    <Loading v-if="loading" />
    <EmptyState v-else-if="favorites.length === 0" message="Вы ещё ничего не добавили в избранное" icon="bi-bookmark">
      <router-link to="/search" class="btn btn-primary btn-sm mt-3">Найти объект</router-link>
    </EmptyState>
    <ObjectList v-else :objects="favoriteObjects" />
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue';
import { useFavoriteStore } from '@/stores/favoriteStore';
import { useObjectStore } from '@/stores/objectStore';
import ObjectList from '@/components/object/ObjectList.vue';
import Loading from '@/components/common/Loading.vue';
import EmptyState from '@/components/common/EmptyState.vue';

export default defineComponent({
  name: 'FavoritesView',
  components: { ObjectList, Loading, EmptyState },
  setup() {
    const favorites = useFavoriteStore();
    const objects = useObjectStore();
    onMounted(async () => { await favorites.load(); if (!objects.objects.length) await objects.loadAll(); });
    const favoriteObjects = computed(() =>
        favorites.items.map((f) => objects.objects.find((o) => o.id === f.objectId)).filter(Boolean) as any[],
    );
    return { favorites: favorites.items, favoriteObjects, loading: favorites.loading };
  },
});
</script>