<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Пользователи</h1>
      <button class="btn btn-primary" @click="openCreateModal">
        <i class="bi bi-person-plus me-2"></i>Добавить пользователя
      </button>
    </div>

    <DataTable
        :columns="columns"
        :items="users"
        :totalItems="totalItems"
        :currentPage="currentPage"
        :perPage="perPage"
        :loading="loading"
        emptyMessage="Пользователи не найдены"
        @search="handleSearch"
        @page-change="handlePageChange"
        @per-page-change="handlePerPageChange"
    >
      <template #cell-role="{ item }">
        <span class="badge" :class="roleBadgeClass(item.role)">
          {{ roleLabel(item.role) }}
        </span>
      </template>

      <template #cell-status="{ item }">
        <span class="badge" :class="item.active ? 'bg-success' : 'bg-secondary'">
          {{ item.active ? 'Активен' : 'Заблокирован' }}
        </span>
      </template>

      <template #cell-registeredAt="{ item }">
        {{ formatDate(item.registeredAt) }}
      </template>

      <template #cell-lastVisit="{ item }">
        {{ item.lastVisit ? formatDate(item.lastVisit) : '—' }}
      </template>

      <template #cell-actions="{ item }">
        <div class="btn-group btn-group-sm">
          <button class="btn btn-outline-primary" @click="openEditModal(item)" title="Редактировать">
            <i class="bi bi-pencil"></i>
          </button>
          <button
              class="btn btn-outline-warning"
              @click="toggleStatus(item)"
              :title="item.active ? 'Заблокировать' : 'Разблокировать'"
          >
            <i :class="item.active ? 'bi bi-lock' : 'bi bi-unlock'"></i>
          </button>
          <button
              class="btn btn-outline-danger"
              @click="handleDelete(item)"
              :disabled="item.id === currentUser?.id"
              title="Удалить"
          >
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Модальное окно создания/редактирования -->
    <div v-if="showModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)" @click.self="closeModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Редактировать пользователя' : 'Создать пользователя' }}</h5>
            <button class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveUser" novalidate>
              <div class="mb-3">
                <label class="form-label">Имя *</label>
                <input
                    type="text"
                    class="form-control"
                    v-model="form.name"
                    :class="{ 'is-invalid': submitted && !form.name }"
                    required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Email *</label>
                <input
                    type="email"
                    class="form-control"
                    v-model="form.email"
                    :class="{ 'is-invalid': submitted && !form.email }"
                    required
                >
              </div>

              <div class="mb-3">
                <label class="form-label">
                  Пароль {{ isEditing ? '(оставьте пустым, чтобы не менять)' : '*' }}
                </label>
                <input
                    type="password"
                    class="form-control"
                    v-model="form.password"
                    :class="{ 'is-invalid': submitted && !isEditing && !form.password }"
                    :required="!isEditing"
                >
              </div>

              <div class="mb-3">
                <label class="form-label">Роль *</label>
                <select class="form-select" v-model="form.role" required>
                  <option value="administrator">Администратор</option>
                  <option value="editor">Редактор</option>
                  <option value="viewer">Наблюдатель</option>
                </select>
              </div>

              <div class="form-check form-switch">
                <input class="form-check-input" type="checkbox" v-model="form.active">
                <label class="form-check-label">Активен</label>
              </div>

              <div v-if="formErrors.length > 0" class="alert alert-danger mt-3 mb-0">
                <ul class="mb-0">
                  <li v-for="(err, index) in formErrors" :key="index">{{ err }}</li>
                </ul>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Отмена</button>
            <button type="button" class="btn btn-primary" @click="saveUser" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
        :isVisible="showDeleteModal"
        title="Удалить пользователя?"
        message="Это действие нельзя отменить. Все данные пользователя будут потеряны."
        confirmText="Удалить"
        :isLoading="deleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/auth';
import { useNotification } from '@/composables/useNotification';
import { usePagination } from '@/composables/usePagination';
import { useModal } from '@/composables/useModal';
import DataTable from '@/components/tables/DataTable.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'UserListPage',
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
        { key: 'name', label: 'Имя', sortable: true },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'role', label: 'Роль', sortable: true },
        { key: 'status', label: 'Статус', sortable: false },
        { key: 'registeredAt', label: 'Регистрация', sortable: true },
        { key: 'lastVisit', label: 'Последний вход', sortable: true },
        { key: 'actions', label: 'Действия', sortable: false }
      ],
      searchQuery: '',
      showModal: false,
      isEditing: false,
      form: { name: '', email: '', password: '', role: 'viewer', active: true },
      submitted: false,
      saving: false,
      formErrors: [],
      userToDelete: null,
      deleting: false
    };
  },
  computed: {
    ...mapState(useUserStore, ['items', 'totalItems', 'loading']),
    ...mapState(useAuthStore, ['user']),
    users() { return this.items; },
    currentUser() { return this.user; },
    currentPage() { return this.pagination.currentPage.value; },
    perPage() { return this.pagination.perPage.value; },
    showDeleteModal() { return this.modal.isVisible.value; }
  },
  async created() { await this.loadData(); },
  methods: {
    ...mapActions(useUserStore, ['fetchUsers', 'createUser', 'updateUser', 'deleteUser', 'toggleStatus']),
    async loadData() {
      try {
        await this.fetchUsers({ page: this.currentPage, limit: this.perPage, search: this.searchQuery });
        this.pagination.totalItems.value = this.totalItems;
      } catch (e) {
        this.error('Ошибка загрузки пользователей');
      }
    },
    handleSearch(q) { this.searchQuery = q; this.pagination.currentPage.value = 1; this.loadData(); },
    handlePageChange(p) { this.pagination.setPage(p); this.loadData(); },
    handlePerPageChange(pp) { this.pagination.perPage.value = pp; this.pagination.currentPage.value = 1; this.loadData(); },
    openCreateModal() {
      this.form = { name: '', email: '', password: '', role: 'viewer', active: true };
      this.isEditing = false;
      this.submitted = false;
      this.formErrors = [];
      this.showModal = true;
    },
    openEditModal(user) {
      this.form = {
        id: user.id,
        name: user.name || '',
        email: user.email || '',
        password: '',
        role: user.role || 'viewer',
        active: user.active !== false
      };
      this.isEditing = true;
      this.submitted = false;
      this.formErrors = [];
      this.showModal = true;
    },
    closeModal() { this.showModal = false; },
    async saveUser() {
      this.submitted = true;
      this.formErrors = [];

      if (!this.form.name || !this.form.email) return;
      if (!this.isEditing && !this.form.password) return;

      this.saving = true;
      try {
        const payload = { ...this.form };
        if (this.isEditing && !payload.password) delete payload.password;

        if (this.isEditing) {
          await this.updateUser(this.form.id, payload);
          this.success('Пользователь обновлён');
        } else {
          await this.createUser(payload);
          this.success('Пользователь создан');
        }
        this.closeModal();
        await this.loadData();
      } catch (e) {
        if (e.errors) {
          this.formErrors = e.errors.map(err => err.message || err);
        } else {
          this.error(e.response?.data?.message || 'Ошибка сохранения');
        }
      } finally {
        this.saving = false;
      }
    },
    async toggleStatus(user) {
      try {
        await this.toggleStatus(user.id, !user.active);
        this.success(user.active ? 'Пользователь заблокирован' : 'Пользователь разблокирован');
      } catch (e) {
        this.error('Ошибка изменения статуса');
      }
    },
    handleDelete(user) {
      this.userToDelete = user;
      this.modal.openModal(user);
    },
    async confirmDelete() {
      this.deleting = true;
      try {
        await this.deleteUser(this.userToDelete.id);
        this.success('Пользователь удалён');
        this.modal.closeModal();
        await this.loadData();
      } catch (e) {
        this.error('Ошибка удаления');
      } finally {
        this.deleting = false;
      }
    },
    cancelDelete() {
      this.userToDelete = null;
      this.modal.closeModal();
    },
    roleBadgeClass(role) {
      return {
        administrator: 'bg-danger',
        editor: 'bg-primary',
        viewer: 'bg-secondary'
      }[role] || 'bg-secondary';
    },
    roleLabel(role) {
      return {
        administrator: 'Администратор',
        editor: 'Редактор',
        viewer: 'Наблюдатель'
      }[role] || role;
    },
    formatDate(date) {
      if (!date) return '—';
      return new Date(date).toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    }
  }
};
</script>