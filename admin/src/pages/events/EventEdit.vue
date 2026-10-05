<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEdit ? 'Редактировать мероприятие' : 'Создать мероприятие' }}</h1>
      <router-link to="/events" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Назад
      </router-link>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row">
            <div class="col-md-8 mb-3">
              <label class="form-label">Название *</label>
              <input type="text" class="form-control" v-model="form.name" required :class="{ 'is-invalid': submitted && !form.name }">
              <div class="invalid-feedback">Введите название мероприятия</div>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Статус</label>
              <select class="form-select" v-model="form.status">
                <option value="upcoming">Предстоящее</option>
                <option value="active">Активно</option>
                <option value="past">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
          </div>

          <div class="row">
            <div class="col-md-4 mb-3">
              <label class="form-label">Дата *</label>
              <input type="date" class="form-control" v-model="form.date" required :class="{ 'is-invalid': submitted && !form.date }">
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Время начала *</label>
              <input type="time" class="form-control" v-model="form.startTime" required>
            </div>
            <div class="col-md-4 mb-3">
              <label class="form-label">Время окончания</label>
              <input type="time" class="form-control" v-model="form.endTime">
            </div>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Место проведения</label>
              <input type="text" class="form-control" v-model="form.location" placeholder="Аудитория 305, корпус А">
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Категория</label>
              <select class="form-select" v-model="form.categoryId">
                <option value="">Без категории</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Описание</label>
            <textarea class="form-control" rows="4" v-model="form.description"></textarea>
          </div>

          <div class="mb-3">
            <label class="form-label">Изображение</label>
            <input type="file" class="form-control" accept="image/*" @change="handleImageChange">
            <div v-if="form.imageUrl" class="mt-2">
              <img :src="form.imageUrl" class="img-thumbnail" style="max-height: 150px;">
            </div>
          </div>

          <div class="mb-4">
            <label class="form-label">Связанные объекты</label>
            <div class="border rounded p-3">
              <div v-if="selectedObjects.length === 0" class="text-muted">
                Объекты не выбраны. Вы можете связать объекты после сохранения мероприятия.
              </div>
              <div v-else>
                <span v-for="obj in selectedObjects" :key="obj.id" class="badge bg-primary me-2 mb-2">
                  {{ obj.name }}
                  <i class="bi bi-x ms-1" style="cursor: pointer;" @click="removeObject(obj.id)"></i>
                </span>
              </div>
            </div>
            <small class="text-muted">Связывание объектов можно выполнить через редактор объектов</small>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <router-link to="/events" class="btn btn-secondary">Отмена</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useEventStore } from '@/stores/eventStore';
import { useCategoryStore } from '@/stores/categoryStore';
import { useNotification } from '@/composables/useNotification';
import { useUnsavedChanges } from '@/composables/useUnsavedChanges';

export default {
  name: 'EventEditPage',
  setup() {
    return { ...useNotification(), ...useUnsavedChanges() };
  },
  data() {
    return {
      form: {
        name: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        categoryId: '',
        status: 'upcoming',
        imageUrl: '',
        imageFile: null,
        objectIds: []
      },
      selectedObjects: [],
      submitted: false,
      saving: false
    };
  },
  computed: {
    ...mapState(useCategoryStore, { categories: 'items' }),
    isEdit() { return !!this.$route.params.id; }
  },
  watch: {
    form: { handler() { this.markAsDirty(); }, deep: true }
  },
  async created() {
    await this.fetchCategories();

    if (this.isEdit) {
      try {
        await this.fetchEvent(this.$route.params.id);
        const e = this.current;
        this.form = {
          name: e.name || '',
          description: e.description || '',
          date: e.date || '',
          startTime: e.startTime || '',
          endTime: e.endTime || '',
          location: e.location || '',
          categoryId: e.categoryId || '',
          status: e.status || 'upcoming',
          imageUrl: e.imageUrl || '',
          imageFile: null,
          objectIds: e.objectIds || []
        };
        this.selectedObjects = e.objects || [];
        this.markAsClean();
      } catch (err) {
        this.error('Ошибка загрузки мероприятия');
        this.$router.push('/events');
      }
    }
  },
  methods: {
    ...mapActions(useEventStore, ['fetchEvent', 'createEvent', 'updateEvent']),
    ...mapActions(useCategoryStore, ['fetchCategories']),
    handleImageChange(event) {
      const file = event.target.files[0];
      if (file) {
        this.form.imageFile = file;
        this.form.imageUrl = URL.createObjectURL(file);
      }
    },
    removeObject(id) {
      this.form.objectIds = this.form.objectIds.filter(oid => oid !== id);
      this.selectedObjects = this.selectedObjects.filter(o => o.id !== id);
    },
    async handleSubmit() {
      this.submitted = true;
      if (!this.form.name || !this.form.date || !this.form.startTime) return;

      this.saving = true;
      try {
        const formData = new FormData();
        formData.append('name', this.form.name);
        formData.append('description', this.form.description || '');
        formData.append('date', this.form.date);
        formData.append('startTime', this.form.startTime);
        formData.append('endTime', this.form.endTime || '');
        formData.append('location', this.form.location || '');
        formData.append('categoryId', this.form.categoryId || '');
        formData.append('status', this.form.status);

        this.form.objectIds.forEach(id => {
          formData.append('objectIds[]', id);
        });

        if (this.form.imageFile) {
          formData.append('image', this.form.imageFile);
        }

        if (this.isEdit) {
          await this.updateEvent(this.$route.params.id, formData);
          this.success('Мероприятие обновлено');
        } else {
          await this.createEvent(formData);
          this.success('Мероприятие создано');
        }

        this.markAsClean();
        this.$router.push('/events');
      } catch (e) {
        this.error(e.response?.data?.message || 'Ошибка сохранения мероприятия');
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>