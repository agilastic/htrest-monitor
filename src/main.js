import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import { useAuthStore } from './stores/auth'; // Importieren Sie Ihren Auth Store

import './assets/main.css'; // Oder Tailwind CSS, etc.

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);

// Auth-Store initialisieren
const authStore = useAuthStore();
authStore.initializeAuth();

app.mount('#app');
