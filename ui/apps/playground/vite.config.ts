import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 直连 packages/*/src：playground 对库源码热更新，无需先 build。
// 各包在此登记别名。
function pkg(name: string) {
  return fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url))
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // system 含 CSS 子路径（tokens.css 在包根不在 src），走 node_modules 的 exports 解析，不设 src 别名
      '@xihan-ui/core': pkg('core'),
      '@xihan-ui/machine': pkg('machine'),
      '@xihan-ui/behavior': pkg('behavior'),
      '@xihan-ui/headless': pkg('headless'),
      '@xihan-ui/vue': pkg('vue'),
      '@xihan-ui/wc': pkg('wc'),
    },
  },
  server: { port: 5199 },
})
