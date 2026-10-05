<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEdit ? 'Редактировать помещение' : 'Создать помещение' }}</h1>
      <router-link to="/rooms" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-2"></i>Назад</router-link>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Номер помещения *</label>
              <input type="text" class="form-control" v-model="form.number" :class="{ 'is-invalid': submitted && !form.number }" required>
            </div>
            <div class="col-md-8 mb-3">
              <label class="form-label">Название *</label>
              <input type="text" class="form-control" v-model="form.name" :class="{ 'is-invalid': submitted && !form.name }" required>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Этаж *</label>
              <select class="form-select" v-model="form.floorId" :class="{ 'is-invalid': submitted && !form.floorId }" required>
                <option value="">Выберите этаж</option>
                <option v-for="floor in floors" :key="floor.id" :value="floor.id">{{ floor.name }} ({{ floor.number }})</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Тип помещения</label>
              <select class="form-select" v-model="form.type">
                <option value="office">Кабинет</option>
                <option value="classroom">Аудитория</option>
                <option value="lab">Лаборатория</option>
                <option value="common">Общее пространство</option>
                <option value="utility">Подсобное</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Описание</label>
            <textarea class="form-control" rows="3" v-model="form.description"></textarea>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Координаты (JSON)</label>
              <input type="text" class="form-control" v-model="form.coordinates" placeholder='{"x": 100, "y": 200}'>
              <small class="text-muted">Или используйте редактор карты для автоматического заполнения</small>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">ID узла графа (Node ID)</label>
              <input type="number" class="form-control" v-model="form.nodeId">
            </div>
          </div>

          <div class="mb-3 form-check form-switch">
            <input class="form-check-input" type="checkbox" id="accessible" v-model="form.accessible">
            <label class="form-check-label" for="accessible">Доступно для МГН (маломобильных групп населения)</label>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <router-link to="/rooms" class="btn btn-secondary">Отмена</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useRoomStore } from '@/stores/roomStore';
import { useFloorStore } from '@/stores/floorStore';
import { useNotification } from '@/composables/useNotification';
import { useUnsavedChanges } from '@/composables/useUnsavedChanges';

export default {
  name: 'RoomEditPage',
  setup() {
    return { ...useNotification(), ...useUnsavedChanges() };
  },
  data() {
    return {
      form: { number: '', name: '', floorId: '', type: 'office', description: '', coordinates: '', nodeId: null, accessible: false },
      submitted: false,
      saving: false
    };
  },
  computed: {
    ...mapState(useFloorStore, ['items']),
    floors() { return this.items; },
    isEdit() { return !!this.$route.params.id; }
  },
  watch: {
    form: { handler() { this.markAsDirty(); }, deep: true }
  },
  async created() {
    await this.fetchFloors({ limit: 100 }); // Загружаем все этажи для селекта
    if (this.isEdit) {
      await this.fetchRoom(this.$route.params.id);
      const r = this.current;
      this.form = { ...r, floorId: r.floorId || r.floor?.id, coordinates: typeof r.coordinates === 'object' ? JSON.stringify(r.coordinates) : r.coordinates };
      this.markAsClean();
    }
  },
  methods: {
    ...mapActions(useRoomStore, ['fetchRoom', 'createRoom', 'updateRoom']),
    ...mapActions(useFloorStore, ['fetchFloors']),
    async handleSubmit() {
      this.submitted = true;
      if (!this.form.number || !this.form.name || !this.form.floorId) return;

      this.saving = true;
      try {
        const payload = { ...this.form, coordinates: this.form.coordinates ? JSON.parse(this.form.coordinates) : null };
        if (this.isEdit) await this.updateRoom(this.$route.params.id, payload);
        else await this.createRoom(payload);

        this.success('Помещение сохранено');
        this.markAsClean();
        this.$router.push('/rooms');
      } catch (e) {
        this.error(e.response?.data?.message || 'Ошибка сохранения');
      } finally { this.saving = false; }
    }
  }
};
</script>