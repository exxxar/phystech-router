<template>
  <div class="container py-3">
    <h4 class="fw-bold mb-3">Настройки</h4>
    <div class="card border-0 shadow-sm">
      <div class="card-body p-3">
        <div class="mb-3">
          <label class="small text-muted">Тема</label>
          <select class="form-select" :value="settings.theme" @change="update('theme', ($event.target as HTMLSelectElement).value as any)">
            <option value="light">Светлая</option>
            <option value="dark">Тёмная</option>
          </select>
        </div>
        <div class="mb-3">
          <label class="small text-muted">Язык</label>
          <select class="form-select" :value="settings.language" @change="update('language', ($event.target as HTMLSelectElement).value as any)">
            <option value="ru">Русский</option>
            <option value="en">English</option>
          </select>
        </div>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" :checked="settings.notifications" @change="update('notifications', ($event.target as HTMLInputElement).checked)" />
          <label class="form-check-label">Уведомления</label>
        </div>
        <div class="form-check form-switch mb-2">
          <input class="form-check-input" type="checkbox" :checked="settings.geolocation" @change="update('geolocation', ($event.target as HTMLInputElement).checked)" />
          <label class="form-check-label">Использовать геолокацию</label>
        </div>
        <div class="form-check form-switch mb-3">
          <input class="form-check-input" type="checkbox" :checked="settings.keepHistory" @change="update('keepHistory', ($event.target as HTMLInputElement).checked)" />
          <label class="form-check-label">Хранить историю</label>
        </div>
        <button class="btn btn-outline-danger w-100 mb-2" @click="showReset = true">Сбросить персонализацию</button>
        <button class="btn btn-outline-secondary w-100" @click="clearData">Очистить локальные данные</button>
        <div class="small text-muted text-center mt-3">Версия 1.0.0</div>
      </div>
    </div>
    <ConfirmModal :show="showReset" title="Сбросить персонализацию?" message="Все настройки и рекомендации будут сброшены." @confirm="reset" @cancel="showReset = false" />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { useSettingsStore } from '@/stores/settingsStore';
import ConfirmModal from '@/components/common/ConfirmModal.vue';
import type { Settings } from '@/stores/settingsStore';

export default defineComponent({
  name: 'SettingsView',
  components: { ConfirmModal },
  setup() {
    const settings = useSettingsStore();
    const showReset = ref(false);
    function update<K extends keyof Settings>(key: K, value: Settings[K]) { settings.update({ [key]: value }); }
    function reset() { settings.reset(); showReset.value = false; }
    function clearData() {
      localStorage.clear();
      location.reload();
    }
    return { settings: settings.settings, update, reset, clearData, showReset };
  },
});
</script>