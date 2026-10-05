import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
    onNeedRefresh() {
        if (confirm('Доступна новая версия. Обновить?')) updateSW(true);
    },
    onOfflineReady() {
        console.log('Приложение готово к offline-работе');
    },
});