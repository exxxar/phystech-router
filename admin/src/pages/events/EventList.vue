<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Мероприятия</h1>
      <router-link to="/events/create" class="btn btn-primary">
        <i class="bi bi-plus-circle me-2"></i>Добавить мероприятие
      </router-link>
    </div>

    <DataTable
        :columns="columns"
        :items="events"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :perPage="perPage"
        :loading="loading"
        emptyMessage="Мероприятия не найдены"
        @search="handleSearch"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
    >
      <template #cell-date="{ item }">
        {{ formatDate(item.date) }}
      </template>
      <template #cell-time="{ item }">
        {{ item.startTime }} — {{ item.endTime || '—' }}
      </template>
      <template #cell-status="{ item }">
        <span class="badge" :class="statusClass(item.status)">
          {{ statusLabel(item.status) }}
        </span>
      </template>
      <template #cell-objectsCount="{ item }">
        <span class="badge bg-info">{{ item.objectsCount || 0 }}</span>
      </template>
      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <router-link :to="`/events/${item.id}/edit`" class="btn btn-outline-primary">
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
        title="Удалить мероприятие?"
        message="Это действие нельзя отменить. Все связанные объекты останутся, но связь будет потеряна."
        confirmText="Удалить"
        :isLoading="deleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useEventStore } from '@/stores/eventStore';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePagination';
import { useModal } from '@/composables/useModal';
import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'EventListPage',
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
        { key: 'name', label: 'Название', sortable: true },
        { key: 'date', label: 'Дата', sortable: true },
        { key: 'time', label: 'Время', sortable: false },
        { key: 'location', label: 'Место', sortable: true },
        { key: 'status', label: 'Статус', sortable: true },
        { key: 'objectsCount', label: 'Объекты', sortable: false },
        { key: 'actions', label: 'Действия', sortable: false }
      ],
      searchQuery: '',
      eventToDelete: null,
      deleting: false
    };
  },
  computed: {
    ...mapState(useEventStore, ['items', 'totalItems', 'loading']),
    events() { return this.items; },
    currentPage() { return this.pagination.currentPage.value; },
    perPage() { return this.pagination.perPage.value; },
    showDeleteModal() { return this.modal.isVisible.value; }
  },
  async created() { await this.loadData(); },
  methods: {
    ...mapActions(useEventStore, ['fetchEvents', 'deleteEvent']),
    async loadData() {
      try {
        await this.fetchEvents({ page: this.currentPage, limit: this.perPage, search: this.searchQuery });
        this.pagination.totalItems.value = this.totalItems;
      } catch (e) { this.error('Ошибка загрузки мероприятий'); }
    },
    handleSearch(q) { this.searchQuery = q; this.pagination.currentPage.value = 1; this.loadData(); },
    handlePageChange(p) { this.pagination.setPage(p); this.loadData(); },
    handlePerPageChange(pp) { this.pagination.perPage.value = pp; this.pagination.currentPage.value = 1; this.loadData(); },
    handleDelete(event) { this.eventToDelete = event; this.modal.openModal(event); },
    async confirmDelete() {
      this.deleting = true;
      try {
        await this.deleteEvent(this.eventToDelete.id);
        this.success('Мероприятие удалено');
        this.modal.closeModal();
        this.loadData();
      } catch (e) { this.error('Ошибка удаления'); }
      finally { this.deleting = false; }
    },
    cancelDelete() { this.eventToDelete = null; this.modal.closeModal(); },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('ru-RU');
    },
    statusClass(status) {
      return {
        active: 'bg-success',
        upcoming: 'bg-primary',
        past: 'bg-secondary',
        cancelled: 'bg-danger'
      }[status] || 'bg-secondary';
    },
    statusLabel(status) {
      return {
        active: 'Активно',
        upcoming: 'Предстоящее',
        past: 'Завершено',
        cancelled: 'Отменено'
      }[status] || status;
    }
  }
};
</script>