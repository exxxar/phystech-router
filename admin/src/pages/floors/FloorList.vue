<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Этажи</h1>
      <router-link to="/floors/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Добавить этаж
      </router-link>
    </div>

    <DataTable
        :columns="columns"
        :items="floors"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :perPage="perPage"
        :loading="loading"
        emptyMessage="Этажи не найдены"
        @search="handleSearch"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
    >
      <template #cell-number="{ item }">
        {{ item.number }}
      </template>

      <template #cell-name="{ item }">
        <router-link :to="`/floors/${item.id}/edit`">{{ item.name }}</router-link>
      </template>

      <template #cell-roomsCount="{ item }">
        {{ item.roomsCount || 0 }}
      </template>

      <template #cell-active="{ item }">
        <span class="badge" :class="item.active ? 'bg-success' : 'bg-secondary'">
          {{ item.active ? 'Активен' : 'Неактивен' }}
        </span>
      </template>

      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <router-link
              v-if="hasPermission('floors.update')"
              :to="`/floors/${item.id}/edit`"
              class="btn btn-outline-primary"
              title="Редактировать"
          >
            <i class="bi bi-pencil"></i>
          </router-link>
          <router-link
              v-if="hasPermission('floors.map')"
              :to="`/floors/${item.id}/map`"
              class="btn btn-outline-secondary"
              title="Открыть карту"
          >
            <i class="bi bi-map"></i>
          </router-link>
          <button
              v-if="hasPermission('floors.delete')"
              class="btn btn-outline-danger"
              @click="handleDelete(item)"
              title="Удалить"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <ConfirmModal
        :isVisible="showDeleteModal"
        title="Удалить этаж?"
        message="Это действие нельзя отменить. Все связанные помещения и объекты будут удалены."
        confirmText="Удалить"
        :isLoading="deleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useFloorStore } from '@/stores/floorStore';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePagination';
import { useModal } from '@/composables/useModal';
import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'FloorListPage',
  components: {
    DataTable,
    ConfirmModal
  },
  setup() {
    const { success, error } = useNotification();
    const pagination = usePagination(10);
    const modal = useModal();

    return {
      success,
      error,
      pagination,
      modal
    };
  },
  data() {
    return {
      columns: [
        { key: 'number', label: 'Номер', sortable: true },
        { key: 'name', label: 'Название', sortable: true },
        { key: 'roomsCount', label: 'Помещения', sortable: true },
        { key: 'active', label: 'Статус', sortable: true },
        { key: 'actions', label: 'Действия', sortable: false }
      ],
      searchQuery: '',
      floorToDelete: null,
      deleting: false
    };
  },
  computed: {
    ...mapState(useFloorStore, ['floors', 'totalItems', 'loading']),
    currentPage() {
      return this.pagination.currentPage.value;
    },
    perPage() {
      return this.pagination.perPage.value;
    },
    showDeleteModal() {
      return this.modal.isVisible.value;
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
    ...mapActions(useFloorStore, ['fetchFloors', 'deleteFloor']),
    async loadData() {
      try {
        await this.fetchFloors({
          page: this.currentPage,
          limit: this.perPage,
          search: this.searchQuery
        });
        this.pagination.totalItems.value = this.totalItems;
      } catch (err) {
        this.error('Ошибка загрузки этажей');
      }
    },
    handleSearch(query) {
      this.searchQuery = query;
      this.pagination.currentPage.value = 1;
      this.loadData();
    },
    handlePageChange(page) {
      this.pagination.setPage(page);
      this.loadData();
    },
    handlePerPageChange(perPage) {
      this.pagination.perPage.value = perPage;
      this.pagination.currentPage.value = 1;
      this.loadData();
    },
    handleDelete(floor) {
      this.floorToDelete = floor;
      this.modal.openModal(floor);
    },
    async confirmDelete() {
      if (!this.floorToDelete) return;

      this.deleting = true;
      try {
        await this.deleteFloor(this.floorToDelete.id);
        this.success('Этаж успешно удалён');
        this.modal.closeModal();
        await this.loadData();
      } catch (err) {
        this.error('Ошибка удаления этажа');
      } finally {
        this.deleting = false;
      }
    },
    hasPermission(permission) {
      const authStore = useAuthStore();
      if (!authStore.permissions || authStore.permissions.length === 0) return true;
      if (authStore.user?.role === 'administrator') return true;
      return authStore.permissions.includes(permission);
    },
    cancelDelete() {
      this.floorToDelete = null;
      this.modal.closeModal();
    }
  }
};
</script>