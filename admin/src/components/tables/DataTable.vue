<template>
  <div class="card">
    <div class="card-body">
      <!-- Панель фильтров и поиска -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text"><i class="bi bi-search"></i></span>
            <input
                type="text"
                class="form-control"
                placeholder="Поиск..."
                v-model="searchQuery"
                @input="handleSearch"
            />
          </div>
        </div>
        <div class="col-md-3">
          <select class="form-select" v-model="selectedPerPage" @change="handlePerPageChange">
            <option :value="10">10</option>
            <option :value="25">25</option>
            <option :value="50">50</option>
            <option :value="100">100</option>
          </select>
        </div>
        <div class="col-md-3">
          <slot name="actions"></slot>
        </div>
      </div>

      <!-- Таблица -->
      <div class="table-responsive">
        <table class="table table-hover">
          <thead>
          <tr>
            <th
                v-for="column in columns"
                :key="column.key"
                @click="handleSort(column.key)"
                :class="{ 'cursor-pointer': column.sortable }"
            >
              {{ column.label }}
              <span v-if="column.sortable">
                  <i
                      v-if="sortBy === column.key"
                      class="bi"
                      :class="sortOrder === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'"
                  ></i>
                  <i v-else class="bi bi-arrow-down-up text-muted"></i>
                </span>
            </th>
          </tr>
          </thead>
          <tbody>
          <tr v-if="loading">
            <td :colspan="columns.length" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Загрузка...</span>
              </div>
            </td>
          </tr>
          <tr v-else-if="items.length === 0">
            <td :colspan="columns.length" class="text-center py-4 text-muted">
              {{ emptyMessage }}
            </td>
          </tr>
          <tr v-else v-for="item in items" :key="item.id">
            <td v-for="column in columns" :key="column.key">
              <slot :name="`cell-${column.key}`" :item="item">
                {{ getNestedValue(item, column.key) }}
              </slot>
            </td>
          </tr>
          </tbody>
        </table>
      </div>

      <!-- Пагинация -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="text-muted">
          Показано {{ paginationStart }}–{{ paginationEnd }} из {{ totalItems }}
        </div>
        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="handlePrevPage">Назад</a>
            </li>
            <li
                v-for="page in visiblePages"
                :key="page"
                class="page-item"
                :class="{ active: page === currentPage }"
            >
              <a class="page-link" href="#" @click.prevent="handlePageClick(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="handleNextPage">Вперёд</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataTable',
  props: {
    columns: {
      type: Array,
      required: true
    },
    items: {
      type: Array,
      default: () => []
    },
    totalItems: {
      type: Number,
      default: 0
    },
    currentPage: {
      type: Number,
      default: 1
    },
    perPage: {
      type: Number,
      default: 10
    },
    loading: {
      type: Boolean,
      default: false
    },
    emptyMessage: {
      type: String,
      default: 'Нет данных'
    }
  },
  emits: ['search', 'sort', 'page-change', 'per-page-change'],
  data() {
    return {
      searchQuery: '',
      sortBy: null,
      sortOrder: 'asc',
      selectedPerPage: this.perPage
    };
  },
  computed: {
    totalPages() {
      return Math.ceil(this.totalItems / this.selectedPerPage);
    },
    paginationStart() {
      return (this.currentPage - 1) * this.selectedPerPage + 1;
    },
    paginationEnd() {
      const end = this.currentPage * this.selectedPerPage;
      return Math.min(end, this.totalItems);
    },
    visiblePages() {
      const pages = [];
      const maxVisible = 5;
      let start = Math.max(1, this.currentPage - Math.floor(maxVisible / 2));
      let end = Math.min(this.totalPages, start + maxVisible - 1);

      if (end - start + 1 < maxVisible) {
        start = Math.max(1, end - maxVisible + 1);
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      return pages;
    }
  },
  methods: {
    getNestedValue(obj, path) {
      return path.split('.').reduce((acc, part) => acc?.[part], obj);
    },
    handleSearch() {
      this.$emit('search', this.searchQuery);
    },
    handleSort(key) {
      if (this.sortBy === key) {
        this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
      } else {
        this.sortBy = key;
        this.sortOrder = 'asc';
      }
      this.$emit('sort', { sortBy: this.sortBy, sortOrder: this.sortOrder });
    },
    handlePageClick(page) {
      this.$emit('page-change', page);
    },
    handlePrevPage() {
      if (this.currentPage > 1) {
        this.$emit('page-change', this.currentPage - 1);
      }
    },
    handleNextPage() {
      if (this.currentPage < this.totalPages) {
        this.$emit('page-change', this.currentPage + 1);
      }
    },
    handlePerPageChange() {
      this.$emit('per-page-change', this.selectedPerPage);
    }
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>