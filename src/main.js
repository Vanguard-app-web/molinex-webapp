import {createApp} from 'vue'
import 'primeflex/primeflex.css'
import 'primeicons/primeicons.css'
import './style.css'
import App from './app.vue'
import i18n from './i18n.js'
import pinia from './pinia.js'
import router from './router.js'
import PrimeVue from 'primevue/config'
import {MolinexPreset} from './shared/presentation/theme/molinex-preset.js'
import {
  Button,
  Column,
  DataTable,
  DatePicker,
  Drawer,
  IconField,
  InputIcon,
  InputNumber,
  InputText,
  Message,
  ProgressSpinner,
  Select,
  SelectButton,
  Tag,
  Textarea,
  Toast,
  ToastService
} from 'primevue'

const primeUiLicenseKey = import.meta.env.VITE_PRIME_UI_LICENSE_KEY

createApp(App)
  .use(i18n)
  .use(PrimeVue, {
    theme: {preset: MolinexPreset, options: {darkModeSelector: false}},
    ripple: true,
    license: primeUiLicenseKey
  })
  .use(ToastService)
  .component('pv-button', Button)
  .component('pv-column', Column)
  .component('pv-data-table', DataTable)
  .component('pv-date-picker', DatePicker)
  .component('pv-drawer', Drawer)
  .component('pv-icon-field', IconField)
  .component('pv-input-icon', InputIcon)
  .component('pv-input-number', InputNumber)
  .component('pv-input-text', InputText)
  .component('pv-message', Message)
  .component('pv-progress-spinner', ProgressSpinner)
  .component('pv-select', Select)
  .component('pv-select-button', SelectButton)
  .component('pv-tag', Tag)
  .component('pv-textarea', Textarea)
  .component('pv-toast', Toast)
  .use(pinia)
  .use(router)
  .mount('#app')
