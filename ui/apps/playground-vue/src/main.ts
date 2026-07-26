import { createThemeController } from '@xihan-ui/system/runtime'
import { createApp } from 'vue'
import App from './App.vue'
import '@xihan-ui/system/tokens.css'
import '@xihan-ui/styled'
import './styles.css'

// 应用主题到根元素（写 data-theme 等五属性）
createThemeController({ storageKey: 'xh-playground-theme' })

createApp(App).mount('#app')
