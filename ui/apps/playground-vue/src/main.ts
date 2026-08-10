import { createThemeController } from '@xihan-ui/tokens/runtime'
import { createApp } from 'vue'
import App from './App.vue'
import '@xihan-ui/tokens/tokens.css'
import '@xihan-ui/styles'
import './styles.css'

// 应用主题到根元素（写 data-theme 等五属性）
createThemeController({ storageKey: 'xh-playground-theme' })

createApp(App).mount('#app')
