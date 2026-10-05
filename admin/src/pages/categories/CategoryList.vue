<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Категории объектов</h1>
      <button class="btn btn-primary" @click="openCreateModal"><i class="bi bi-plus-circle me-2"></i>Добавить категорию</button>
    </div>

    <DataTable :columns="columns" :items="categories" :loading="loading" emptyMessage="Категории не найдены">
      <template #cell-active="{ item }">
        <span class="badge" :class="item.active ? 'bg-success' : 'bg-secondary'">{{ item.active ? 'Да' : 'Нет' }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" @click="openEditModal(item)"><i class="bi bi-pencil"></i></button>
          <button class="btn btn-outline-danger" @click="handleDelete(item)"><i class="bi bi-trash"></i></button>
        </div>
      </template>
    </DataTable>

    <!-- Модальное окно создания/редактирования (упрощённое для примера) -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">{{ isEditing ? 'Редактировать' : 'Создать' }} категорию</h5><button class="btn-close" @click="closeModal"></button></div>
          <div class="modal-body">
            <form @submit.prevent="saveCategory">
              <div class="mb-3"><label class="form-label">Название *</label><input class="form-control" v-model="form.name" required></div>
              <div class="mb-3"><label class="form-label">Slug</label><input class="form-control" v-model="form.slug"></div>
              <div class="mb-3"><label class="form-label">Порядок</label><input type="number" class="form-control" v-model="form.order"></div>
              <div class="form-check form-switch"><input class="form-check-input" type="checkbox" v-model="form.active"><label class="form-check-label">Активна</label></div>
              <div class="mt-3 text-end">
                <button type="button" class="btn btn-secondary me-2" @click="closeModal">Отмена</button>
                <button type="submit" class="btn btn-primary" :disabled="saving">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal :isVisible="showDeleteModal" title="Удалить категорию?" message="Это действие нельзя отменить." confirmText="Удалить" :isLoading="deleting" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useCategoryStore } from '@/stores/categoryStore';

// Разделяем импорты на разные файлы!
import { useNotification } from '@/composables/useNotification';
import { useModal } from '@/composables/useModal';

import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';




export default {
  name: 'CategoryListPage',
  components: { DataTable, ConfirmModal },
  setup() {
    return {
      ...useNotification(),
      modal: useModal()
    };
  },
  data() {
    return {
      columns: [ { key: 'name', label: 'Название' }, { key: 'slug', label: 'Slug' }, { key: 'order', label: 'Порядок' }, { key: 'active', label: 'Активна' }, { key: 'actions', label: 'Действия', sortable: false } ],
      showModal: false, isEditing: false, form: { name: '', slug: '', order: 0, active: true }, saving: false,
      categoryToDelete: null, deleting: false
    };
  },
  computed: {
    ...mapState(useCategoryStore, ['items', 'loading']),
    categories() { return this.items; },
    showDeleteModal() { return this.modal.isVisible.value; }
  },
  async created() { await this.fetchCategories(); },
  methods: {
    ...mapActions(useCategoryStore, ['fetchCategories', 'createCategory', 'updateCategory', 'deleteCategory']),
    openCreateModal() { this.form = { name: '', slug: '', order: 0, active: true }; this.isEditing = false; this.showModal = true; },
    openEditModal(cat) { this.form = { ...cat }; this.isEditing = true; this.showModal = true; },
    closeModal() { this.showModal = false; },
    async saveCategory() {
      this.saving = true;
      try {
        if (this.isEditing) await this.updateCategory(this.form.id, this.form);
        else await this.createCategory(this.form);
        this.success('Категория сохранена');
        this.closeModal();
        await this.fetchCategories();
      } catch (e) { this.error('Ошибка сохранения'); }
      finally { this.saving = false; }
    },
    handleDelete(cat) { this.categoryToDelete = cat; this.modal.openModal(cat); },
    async confirmDelete() {
      this.deleting = true;
      try { await this.deleteCategory(this.categoryToDelete.id); this.success('Удалено'); this.modal.closeModal(); await this.fetchCategories(); }
      catch (e) { this.error('Ошибка удаления'); }
      finally { this.deleting = false; }
    },
    cancelDelete() { this.categoryToDelete = null; this.modal.closeModal(); }
  }
};
</script>