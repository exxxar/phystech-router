<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>{{ isEdit ? 'Редактировать этаж' : 'Создать этаж' }}</h1>
      <router-link to="/floors" class="btn btn-outline-secondary">
        <i class="bi bi-arrow-left me-2"></i>Назад
      </router-link>
    </div>

    <div class="card border-0 shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit" novalidate>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="number" class="form-label">Номер этажа *</label>
              <input
                  type="text"
                  class="form-control"
                  id="number"
                  v-model="form.number"
                  :class="{ 'is-invalid': submitted && !form.number }"
                  required
              />
              <div class="invalid-feedback">Введите номер этажа</div>
            </div>

            <div class="col-md-6 mb-3">
              <label for="name" class="form-label">Название *</label>
              <input
                  type="text"
                  class="form-control"
                  id="name"
                  v-model="form.name"
                  :class="{ 'is-invalid': submitted && !form.name }"
                  required
              />
              <div class="invalid-feedback">Введите название</div>
            </div>
          </div>

          <div class="mb-3">
            <label for="description" class="form-label">Описание</label>
            <textarea
                class="form-control"
                id="description"
                rows="3"
                v-model="form.description"
            ></textarea>
          </div>

          <div class="mb-3">
            <label for="svgFile" class="form-label">SVG-план</label>
            <input
                type="file"
                class="form-control"
                id="svgFile"
                accept=".svg,image/svg+xml"
                @change="handleFileChange"
            />
            <small class="text-muted">Загрузите SVG-файл плана этажа</small>
          </div>

          <div class="row">
            <div class="col-md-6 mb-3">
              <label for="order" class="form-label">Порядок отображения</label>
              <input
                  type="number"
                  class="form-control"
                  id="order"
                  v-model="form.order"
              />
            </div>

            <div class="col-md-6 mb-3">
              <div class="form-check form-switch mt-4">
                <input
                    class="form-check-input"
                    type="checkbox"
                    id="active"
                    v-model="form.active"
                />
                <label class="form-check-label" for="active">
                  Активен
                </label>
              </div>
            </div>
          </div>

          <div v-if="formErrors.length > 0" class="alert alert-danger">
            <ul class="mb-0">
              <li v-for="(err, index) in formErrors" :key="index">{{ err }}</li>
            </ul>
          </div>

          <div class="d-flex gap-2">
            <button type="submit" class="btn btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              {{ saving ? 'Сохранение...' : 'Сохранить' }}
            </button>
            <router-link to="/floors" class="btn btn-secondary">Отмена</router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useFloorStore } from '@/stores/floorStore';
import { useNotification } from '@/composables/useNotification';
import { useUnsavedChanges } from '@/composables/useUnsavedChanges';

export default {
  name: 'FloorEditPage',
  setup() {
    const { success, error } = useNotification();
    const { isDirty, markAsDirty, markAsClean } = useUnsavedChanges();

    return {
      success,
      error,
      isDirty,
      markAsDirty,
      markAsClean
    };
  },
  data() {
    return {
      form: {
        number: '',
        name: '',
        description: '',
        svgFile: null,
        order: 0,
        active: true
      },
      submitted: false,
      saving: false,
      formErrors: [],
      originalData: null
    };
  },
  computed: {
    ...mapState(useFloorStore, ['current']),
    isEdit() {
      return !!this.$route.params.id;
    }
  },
  watch: {
    form: {
      handler(newVal) {
        if (this.originalData && JSON.stringify(newVal) !== JSON.stringify(this.originalData)) {
          this.markAsDirty();
        }
      },
      deep: true
    }
  },
  async created() {
    if (this.isEdit) {
      try {
        await this.fetchFloor(this.$route.params.id);
        this.form = {
          number: this.current.number || '',
          name: this.current.name || '',
          description: this.current.description || '',
          svgFile: null,
          order: this.current.order || 0,
          active: this.current.active !== false
        };
        this.originalData = { ...this.form };
      } catch (err) {
        this.error('Ошибка загрузки данных этажа');
        this.$router.push('/floors');
      }
    }
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloor', 'createFloor', 'updateFloor']),
    handleFileChange(event) {
      this.form.svgFile = event.target.files[0];
    },
    async handleSubmit() {
      this.submitted = true;
      this.formErrors = [];

      if (!this.form.number || !this.form.name) {
        return;
      }

      this.saving = true;
      try {
        const formData = new FormData();
        formData.append('number', this.form.number);
        formData.append('name', this.form.name);
        formData.append('description', this.form.description || '');
        formData.append('order', this.form.order);
        formData.append('active', this.form.active);

        if (this.form.svgFile) {
          formData.append('svg', this.form.svgFile);
        }

        if (this.isEdit) {
          await this.updateFloor(this.$route.params.id, formData);
          this.success('Этаж успешно обновлён');
        } else {
          await this.createFloor(formData);
          this.success('Этаж успешно создан');
        }

        this.markAsClean();
        this.$router.push('/floors');
      } catch (err) {
        if (err.errors) {
          this.formErrors = err.errors.map(e => e.message || e);
        } else {
          this.error('Ошибка сохранения этажа');
        }
      } finally {
        this.saving = false;
      }
    }
  }
};
</script>