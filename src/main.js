import {createApp} from 'vue'
import './style.css'
import App from './app.vue'
import i18n from './i18n.js'
import pinia from './pinia.js'
import router from './router.js'

createApp(App)
  .use(i18n)
  .use(pinia)
  .use(router)
  .mount('#app')
