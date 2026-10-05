<template>
  <div>
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1>Медиатека</h1>
      <button class="btn btn-primary" @click="showUploadModal = true">
        <i class="bi bi-cloud-upload me-2"></i>Загрузить файл
      </button>
    </div>

    <!-- Поиск и фильтры -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <div class="input-group">
              <span class="input-group-text"><i class="bi bi-search"></i></span>
              <input
                  type="text"
                  class="form-control"
                  placeholder="Поиск по имени..."
                  v-model="searchQuery"
                  @input="handleSearch"
              >
            </div>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="filterType" @change="loadMedia">
              <option value="">Все типы</option>
              <option value="image">Изображения</option>
              <option value="video">Видео</option>
              <option value="document">Документы</option>
            </select>
          </div>
          <div class="col-md-3">
            <select class="form-select" v-model="perPage" @change="loadMedia">
              <option :value="20">20</option>
              <option :value="40">40</option>
              <option :value="60">60</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid файлов -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else-if="items.length === 0" class="text-center py-5 text-muted">
      <i class="bi bi-folder2-open fs-1"></i>
      <p class="mt-2">Файлы не найдены</p>
    </div>

    <div v-else class="row g-3">
      <div v-for="media in items" :key="media.id" class="col-md-3 col-sm-4 col-6">
        <div class="card border-0 shadow-sm h-100">
          <div class="position-relative">
            <img
                v-if="isImage(media)"
                :src="media.url"
                :alt="media.alt || media.name"
                class="card-img-top"
                style="height: 200px; object-fit: cover; cursor: pointer;"
                @click="openPreview(media)"
            >
            <div
                v-else
                class="card-img-top bg-light d-flex align-items-center justify-content-center"
                style="height: 200px; cursor: pointer;"
                @click="openPreview(media)"
            >
              <i :class="getFileIcon(media)" class="fs-1 text-muted"></i>
            </div>
            <button
                class="btn btn-sm btn-danger position-absolute top-0 end-0 m-2"
                @click="handleDelete(media)"
                title="Удалить"
            >
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="card-body p-2">
            <small class="text-truncate d-block" :title="media.name">{{ media.name }}</small>
            <small class="text-muted">{{ formatFileSize(media.size) }}</small>
          </div>
        </div>
      </div>
    </div>

    <!-- Пагинация -->
    <div v-if="totalItems > perPage" class="d-flex justify-content-center mt-4">
      <nav>
        <ul class="pagination">
          <li class="page-item" :class="{ disabled: currentPage === 1 }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Назад</a>
          </li>
          <li
              v-for="page in totalPages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
          >
            <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
          </li>
          <li class="page-item" :class="{ disabled: currentPage === totalPages }">
            <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Вперёд</a>
          </li>
        </ul>
      </nav>
    </div>

    <!-- Модальное окно загрузки -->
    <div v-if="showUploadModal" class="modal fade show d-block" style="background: rgba(0,0,0,0.5)" @click.self="closeUploadModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Загрузить файл</h5>
            <button class="btn-close" @click="closeUploadModal"></button>
          </div>
          <div class="modal-body">
            <div
                class="border rounded p-4 text-center mb-3"
                :class="{ 'border-primary bg-light': isDragging }"
                @dragover.prevent="isDragging = true"
                @dragleave="isDragging = false"
                @drop.prevent="handleDrop"
            >
              <i class="bi bi-cloud-upload fs-1 text-muted"></i>
              <p class="mt-2 mb-0">Перетащите файл сюда или</p>
              <label class="btn btn-primary mt-2">
                Выберите файл
                <input type="file" class="d-none" @change="handleFileSelect" accept="image/*,video/*,.pdf,.doc,.docx">
              </label>
            </div>

            <div v-if="uploadForm.file" class="alert alert-info py-2">
              <small>Выбран файл: <strong>{{ uploadForm.file.name }}</strong></small>
            </div>

            <div class="mb-3">
              <label class="form-label">Alt текст</label>
              <input type="text" class="form-control" v-model="uploadForm.alt" placeholder="Описание для accessibility">
            </div>

            <div class="mb-3">
              <label class="form-label">Теги (через запятую)</label>
              <input type="text" class="form-control" v-model="uploadForm.tags" placeholder="логотип, баннер">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeUploadModal">Отмена</button>
            <button type="button" class="btn btn-primary" @click="uploadFile" :disabled="!uploadForm.file || uploading">
              <span v-if="uploading" class="spinner-border spinner-border-sm me-2"></span>
              Загрузить
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Модальное окно предпросмотра -->
    <div v-if="previewMedia" class="modal fade show d-block" style="background: rgba(0,0,0,0.8)" @click.self="closePreview">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ previewMedia.name }}</h5>
            <button class="btn-close btn-close-white" @click="closePreview"></button>
          </div>
          <div class="modal-body text-center">
            <img
                v-if="isImage(previewMedia)"
                :src="previewMedia.url"
                :alt="previewMedia.alt"
                class="img-fluid"
                style="max-height: 70vh;"
            >
            <div v-else class="py-5">
              <i :class="getFileIcon(previewMedia)" class="fs-1 text-muted"></i>
              <p class="mt-2">Предпросмотр недоступен для этого типа файла</p>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-primary" @click="copyUrl">
              <i class="bi bi-clipboard me-2"></i>Копировать URL
            </button>
            <button type="button" class="btn btn-secondary" @click="closePreview">Закрыть</button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmModal
        :isVisible="showDeleteModal"
        title="Удалить файл?"
        message="Это действие нельзя отменить. Файл будет удалён из системы."
        confirmText="Удалить"
        :isLoading="deleting"
        @confirm="confirmDelete"
        @cancel="cancelDelete"
    />
  </div>
</template>

<script>
import { mapState, mapActions } from 'pinia';
import { useMediaStore } from '@/stores/mediaStore';
import { useNotification } from '@/composables/useNotification';
import { useModal } from '@/composables/useModal';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';

export default {
  name: 'MediaLibraryPage',
  components: { ConfirmModal },
  setup() {
    return { ...useNotification(), modal: useModal() };
  },
  data() {
    return {
      searchQuery: '',
      filterType: '',
      perPage: 20,
      currentPage: 1,
      showUploadModal: false,
      isDragging: false,
      uploading: false,
      uploadForm: {
        file: null,
        alt: '',
        tags: ''
      },
      previewMedia: null,
      mediaToDelete: null,
      deleting: false
    };
  },
  computed: {
    ...mapState(useMediaStore, ['items', 'totalItems', 'loading']),
    totalPages() {
      return Math.ceil(this.totalItems / this.perPage);
    },
    showDeleteModal() {
      return this.modal.isVisible.value;
    }
  },
  async created() {
    await this.loadMedia();
  },
  methods: {
    ...mapActions(useMediaStore, ['fetchMedia', 'uploadFile', 'deleteMedia']),
    async loadMedia() {
      try {
        await this.fetchMedia({
          page: this.currentPage,
          limit: this.perPage,
          search: this.searchQuery,
          type: this.filterType
        });
      } catch (e) {
        this.error('Ошибка загрузки файлов');
      }
    },
    handleSearch() {
      this.currentPage = 1;
      this.loadMedia();
    },
    changePage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page;
        this.loadMedia();
      }
    },
    handleFileSelect(event) {
      this.uploadForm.file = event.target.files[0];
    },
    handleDrop(event) {
      this.isDragging = false;
      this.uploadForm.file = event.dataTransfer.files[0];
    },
    async uploadFile() {
      if (!this.uploadForm.file) return;

      this.uploading = true;
      try {
        await this.uploadFile(this.uploadForm.file, {
          alt: this.uploadForm.alt,
          tags: this.uploadForm.tags
        });
        this.success('Файл загружен');
        this.closeUploadModal();
      } catch (e) {
        this.error('Ошибка загрузки файла');
      } finally {
        this.uploading = false;
      }
    },
    closeUploadModal() {
      this.showUploadModal = false;
      this.uploadForm = { file: null, alt: '', tags: '' };
    },
    openPreview(media) {
      this.previewMedia = media;
    },
    closePreview() {
      this.previewMedia = null;
    },
    copyUrl() {
      navigator.clipboard.writeText(this.previewMedia.url);
      this.success('URL скопирован');
    },
    handleDelete(media) {
      this.mediaToDelete = media;
      this.modal.openModal(media);
    },
    async confirmDelete() {
      this.deleting = true;
      try {
        await this.deleteMedia(this.mediaToDelete.id);
        this.success('Файл удалён');
        this.modal.closeModal();
      } catch (e) {
        this.error('Ошибка удаления');
      } finally {
        this.deleting = false;
      }
    },
    cancelDelete() {
      this.mediaToDelete = null;
      this.modal.closeModal();
    },

    isImage(media) {
      return media.type?.startsWith('image/');
    },
    getFileIcon(media) {
      if (media.type?.startsWith('video/')) return 'bi bi-file-earmark-play';
      if (media.type === 'application/pdf') return 'bi bi-file-earmark-pdf';
      if (media.type?.includes('word') || media.type?.includes('document')) return 'bi bi-file-earmark-word';
      if (media.type?.includes('sheet') || media.type?.includes('excel')) return 'bi bi-file-earmark-spreadsheet';
      if (media.type?.startsWith('image/')) return 'bi bi-file-earmark-image';
      return 'bi bi-file-earmark';
    },
    formatFileSize(bytes) {
      if (!bytes) return '—';
      const units = ['Б', 'КБ', 'МБ', 'ГБ'];
      let size = bytes;
      let unitIndex = 0;
      while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
      }
      return `${size.toFixed(1)} ${units[unitIndex]}`;
    }
  }
};
</script>