<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Помещения</h1>
      <router-link to="/rooms/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Добавить помещение
      </router-link>
    </div>

    <DataTable
        :columns="columns"
        :items="rooms"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :perPage="perPage"
        :loading="loading"
        @search="handleSearch"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
    >
      <template #cell-floor="{ item }">
        {{ item.floor?.name || 'Не указан' }}
      </template>
      <template #cell-accessible="{ item }">
        <i :class="item.accessible ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-muted'"></i>
      </template>
      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <router-link :to="`/rooms/${item.id}/edit`" class="btn btn-outline-primary">
            <i class="bi bi-pencil"></i>
          </router-link>
          <button class="btn btn-outline-danger" @click="handleDelete(item)">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
        :isVisible="showDeleteModal"
        title="Удалить помещение?"
        message="Это действие нельзя отменить."
        confirmText="Удалить"
        :isLoading="deleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useRoomStore } from '@/stores/roomStore';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePagination';
import { useModal } from '@/composables/useModal';
import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'RoomListPage',
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
        { key: 'number', label: 'Номер', sortable: true },
        { key: 'name', label: 'Название', sortable: true },
        { key: 'floor', label: 'Этаж', sortable: true },
        { key: 'type', label: 'Тип', sortable: true },
        { key: 'accessible', label: 'Доступность', sortable: false },
        { key: 'actions', label: 'Действия', sortable: false }
      ],
      searchQuery: '',
      roomToDelete: null,
      deleting: false
    };
  },
  computed: {
    ...mapState(useRoomStore, ['items', 'totalItems', 'loading']),
    rooms() { return this.items; },
    currentPage() { return this.pagination.currentPage.value; },
    perPage() { return this.pagination.perPage.value; },
    showDeleteModal() { return this.modal.isVisible.value; }
  },
  async created() { await this.loadData(); },
  methods: {
    ...mapActions(useRoomStore, ['fetchRooms', 'deleteRoom']),
    async loadData() {
      try {
        await this.fetchRooms({ page: this.currentPage, limit: this.perPage, search: this.searchQuery });
        this.pagination.totalItems.value = this.totalItems;
      } catch (e) { this.error('Ошибка загрузки'); }
    },
    handleSearch(q) { this.searchQuery = q; this.pagination.currentPage.value = 1; this.loadData(); },
    handlePageChange(p) { this.pagination.setPage(p); this.loadData(); },
    handlePerPageChange(pp) { this.pagination.perPage.value = pp; this.pagination.currentPage.value = 1; this.loadData(); },
    handleDelete(room) { this.roomToDelete = room; this.modal.openModal(room); },
    async confirmDelete() {
      this.deleting = true;
      try {
        await this.deleteRoom(this.roomToDelete.id);
        this.success('Помещение удалено');
        this.modal.closeModal();
        this.loadData();
      } catch (e) { this.error('Ошибка удаления'); }
      finally { this.deleting = false; }
    },
    cancelDelete() { this.roomToDelete = null; this.modal.closeModal(); }
  }
};
</script>