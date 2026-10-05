<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Информационные объекты</h1>
      <router-link to="/objects/create" class="btn btn-primary"><i class="bi bi-plus-circle me-2"></i>Добавить объект</router-link>
    </div>

    <DataTable
        :columns="columns" :items="objects" :totalItems="totalItems"
        :currentPage="currentPage" :perPage="perPage" :loading="loading"
        @search="handleSearch" @page-change="handlePageChange" @per-page-change="handlePerPageChange"
    >
      <template #cell-status="{ item }">
        <span class="badge" :class="item.status === 'published' ? 'bg-success' : 'bg-secondary'">
          {{ item.status === 'published' ? 'Опубликован' : 'Черновик' }}
        </span>
      </template>
      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <router-link :to="`/objects/${item.id}/edit`" class="btn btn-outline-primary"><i class="bi bi-pencil"></i></router-link>
          <button class="btn btn-outline-danger" @click="handleDelete(item)"><i class="bi bi-trash"></i></button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal :isVisible="showDeleteModal" title="Удалить объект?" message="Это действие нельзя отменить." confirmText="Удалить" :isLoading="deleting" @confirm="confirmDelete" @cancel="cancelDelete" />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useObjectStore } from '@/stores/objectStore';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePagination';
import { useModal } from '@/composables/useModal';
import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'ObjectListPage',
  components: { DataTable, ConfirmModal },
  setup() {
    return {
      ...useNotification(),
      pagination: usePagination(15),
      modal: useModal()
    };
  },
  data() {
    return {
      columns: [
        { key: 'name', label: 'Название' }, { key: 'type', label: 'Тип' },
        { key: 'category.name', label: 'Категория' }, { key: 'status', label: 'Статус' }, { key: 'actions', label: 'Действия', sortable: false }
      ],
      searchQuery: '', objectToDelete: null, deleting: false
    };
  },
  computed: {
    ...mapState(useObjectStore, ['items', 'totalItems', 'loading']),
    objects() { return this.items; },
    currentPage() { return this.pagination.currentPage.value; },
    perPage() { return this.pagination.perPage.value; },
    showDeleteModal() { return this.modal.isVisible.value; }
  },
  async created() { await this.loadData(); },
  methods: {
    ...mapActions(useObjectStore, ['fetchObjects', 'deleteObject']),
    async loadData() {
      try {
        await this.fetchObjects({ page: this.currentPage, limit: this.perPage, search: this.searchQuery });
        this.pagination.totalItems.value = this.totalItems;
      } catch (e) { this.error('Ошибка загрузки'); }
    },
    handleSearch(q) { this.searchQuery = q; this.pagination.currentPage.value = 1; this.loadData(); },
    handlePageChange(p) { this.pagination.setPage(p); this.loadData(); },
    handlePerPageChange(pp) { this.pagination.perPage.value = pp; this.pagination.currentPage.value = 1; this.loadData(); },
    handleDelete(obj) { this.objectToDelete = obj; this.modal.openModal(obj); },
    async confirmDelete() {
      this.deleting = true;
      try {
        await this.deleteObject(this.objectToDelete.id);
        this.success('Объект удалён'); this.modal.closeModal(); this.loadData();
      } catch (e) { this.error('Ошибка удаления'); }
      finally { this.deleting = false; }
    },
    cancelDelete() { this.objectToDelete = null; this.modal.closeModal(); }
  }
};
</script>