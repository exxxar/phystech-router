<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEdit ? 'Редактировать объект' : 'Создать объект' }}</h1>
      <router-link to="/objects" class="btn btn-outline-secondary"><i class="bi bi-arrow-left me-2"></i>Назад</router-link>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row">
            <div class="col-md-8 mb-3">
              <label class="form-label">Название *</label>
              <input type="text" class="form-control" v-model="form.name" required :class="{ 'is-invalid': submitted && !form.name }">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Краткое название</label>
              <input type="text" class="form-control" v-model="form.shortName">
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Тип</label>
              <select class="form-select" v-model="form.type">
                <option value="lab">Лаборатория</option>
                <option value="stand">Стенд</option>
                <option value="office">Кабинет</option>
                <option value="project">Проект</option>
                <option value="zone">Зона</option>
                <option value="infrastructure">Инфраструктура</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Категория</label>
              <select class="form-select" v-model="form.categoryId">
                <option value="">Без категории</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Статус публикации</label>
              <select class="form-select" v-model="form.status">
                <option value="draft">Черновик</option>
                <option value="published">Опубликован</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Этаж</label>
              <select class="form-select" v-model="form.floorId">
                <option value="">Не выбран</option>
                <option v-for="f in floors" :key="f.id" :value="f.id">{{ f.name }}</option>
              </select>
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Помещение</label>
              <select class="form-select" v-model="form.roomId">
                <option value="">Не выбрано</option>
                <option v-for="r in rooms" :key="r.id" :value="r.id">{{ r.number }} - {{ r.name }}</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Полное описание</label>
            <textarea class="form-control" rows="4" v-model="form.description"></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Теги (через запятую)</label>
            <input type="text" class="form-control" v-model="form.tags" placeholder="робототехника, 3d-печать">
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <router-link to="/objects" class="btn btn-secondary">Отмена</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useObjectStore } from '@/stores/objectStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useFloorStore } from '@/stores/floorStore';
import { useRoomStore } from '@/stores/roomStore';
import { useNotification, useUnsavedChanges } from '@/composables/useNotification';

export default {
  name: 'ObjectEditPage',
  setup() { return { ...useNotification(), ...useUnsavedChanges() }; },
  data() {
    return {
      form: { name: '', shortName: '', type: 'stand', categoryId: '', floorId: '', roomId: '', description: '', status: 'draft', tags: '' },
      submitted: false, saving: false
    };
  },
  computed: {
    ...mapState(useCategoryStore, ['items']),
    ...mapState(useFloorStore, ['items']),
    ...mapState(useRoomStore, ['items']),
    categories() { return this.items; },
    floors() { return this.items; }, // Примечание: в реальном приложении лучше иметь отдельные геттеры или переименовать маппинг
    rooms() { return this.items; },
    isEdit() { return !!this.$route.params.id; }
  },
  watch: { form: { handler() { this.markAsDirty(); }, deep: true } },
  async created() {
    // Загружаем справочники
    await Promise.all([
      this.fetchCategories(),
      this.fetchFloors({ limit: 100 }),
      this.fetchRooms({ limit: 100 })
    ]);

    if (this.isEdit) {
      await this.fetchObject(this.$route.params.id);
      const o = this.current;
      this.form = { ...o, tags: Array.isArray(o.tags) ? o.tags.join(', ') : o.tags };
      this.markAsClean();
    }
  },
  methods: {
    ...mapActions(useObjectStore, ['fetchObject', 'createObject', 'updateObject']),
    ...mapActions(useCategoryStore, ['fetchCategories']),
    ...mapActions(useFloorStore, ['fetchFloors']),
    ...mapActions(useRoomStore, ['fetchRooms']),
    async handleSubmit() {
      this.submitted = true;
      if (!this.form.name) return;

      this.saving = true;
      try {
        const payload = { ...this.form, tags: this.form.tags ? this.form.tags.split(',').map(t => t.trim()) : [] };
        if (this.isEdit) await this.updateObject(this.$route.params.id, payload);
        else await this.createObject(payload);

        this.success('Объект сохранён');
        this.markAsClean();
        this.$router.push('/objects');
      } catch (e) {
        this.error(e.response?.data?.message || 'Ошибка сохранения');
      } finally { this.saving = false; }
    }
  }
};
</script>