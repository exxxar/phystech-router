<template>
  <div class="object-card card h-100 border-0 shadow-sm">
    <div class="card-body p-3">
      <div class="d-flex justify-content-between align-items-start mb-2">
        <div>
          <div class="fw-semibold">{{ object.name }}</div>
          <div class="small text-muted">{{ typeLabel }} · Этаж {{ object.floor }}<span v-if="object.roomNumber"> · №{{ object.roomNumber }}</span></div>
        </div>
        <span class="badge" :class="object.availability.isAvailable ? 'bg-success-subtle text-success' : 'bg-secondary-subtle text-secondary'">
          {{ object.availability.isAvailable ? 'Доступно' : 'Недоступно' }}
        </span>
      </div>
      <p class="small text-muted mb-2">{{ object.description }}</p>
      <div class="d-flex flex-wrap gap-1 mb-3">
        <span v-for="t in object.tags.slice(0, 3)" :key="t" class="badge bg-light text-dark border">{{ t }}</span>
      </div>
      <div class="d-flex gap-2">
        <router-link :to="`/objects/${object.id}`" class="btn btn-outline-primary btn-sm flex-grow-1">Подробнее</router-link>
        <router-link :to="`/route?to=${object.id}`" class="btn btn-primary btn-sm">
          <i class="bi bi-signpost-split me-1"></i>Маршрут
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import type { DepartmentObject } from '@/types';
const typeLabels: Record<string, string> = {
  classroom: 'Аудитория', lab: 'Лаборатория', office: 'Кабинет',
  department: 'Кафедра', stairs: 'Лестница', entrance: 'Вход', info: 'Инфо-точка', corridor: 'Коридор',
};
export default defineComponent({
  name: 'ObjectCard',
  props: { object: { type: Object as () => DepartmentObject, required: true } },
  setup(props) {
    const typeLabel = computed(() => typeLabels[props.object.type] || props.object.type);
    return { typeLabel };
  },
});
</script>

<style scoped>
.object-card { transition: transform 0.15s; cursor: pointer; }
.object-card:hover { transform: translateY(-2px); }
</style>