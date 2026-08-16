import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

// 直连 packages/<角色组>/<包>/src：playground 对库源码热更新，无需先 build。
// 各包在此登记别名。
function pkg(name: string) {
  return fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url))
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      // kernel 的子路径入口在 src 深处，src 别名解析不到，逐条指到具体文件（须排在通用别名之前）
      '@xihan-ui/kernel/skin-check': fileURLToPath(new URL('../../packages/engine/kernel/src/diagnostics/skin-check.ts', import.meta.url)),
      '@xihan-ui/kernel/deprecations': fileURLToPath(new URL('../../packages/engine/kernel/src/diagnostics/deprecations.ts', import.meta.url)),
      '@xihan-ui/kernel/metadata': fileURLToPath(new URL('../../packages/engine/kernel/src/metadata.ts', import.meta.url)),
      // system 含 CSS 子路径（tokens.css 在包根不在 src），走 node_modules 的 exports 解析，不设 src 别名
      '@xihan-ui/kernel': pkg('engine/kernel'),
      '@xihan-ui/machine': pkg('engine/machine'),
      '@xihan-ui/behavior': pkg('engine/behavior'),
      '@xihan-ui/headless': pkg('engine/headless'),
      '@xihan-ui/position': pkg('engine/position'),
      '@xihan-ui/backgrounds': pkg('features/backgrounds'),
      '@xihan-ui/vue': pkg('adapters/vue'),
    },
  },
  server: { port: 5199 },
})
