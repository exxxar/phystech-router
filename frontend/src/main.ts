import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';

// CSS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/main.css';

// JS (ДОБАВИТЬ ЭТУ СТРОКУ для работы выпадающих меню и offcanvas)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import './registerServiceWorker';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount('#app');