// import './assets/main.css'

import router from './router';
import { createApp } from 'vue';
import App from './App.vue';
import './axios-config';


const app = createApp(App)
app.use(router);
app.mount('#app');
