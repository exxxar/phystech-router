import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// Bootstrap 5 CSS и JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Глобальные стили админки
import './assets/admin.css'; // Создайте этот файл с базовыми стилями (тёмно-синий сайдбар и т.д.)

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');