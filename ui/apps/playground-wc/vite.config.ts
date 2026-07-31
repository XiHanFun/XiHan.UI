import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// 直连 packages/*/src：对库源码热更新，无需先 build。WC 环境独立包，端口 5200。
function pkg(name: string): string {
  return fileURLToPath(new URL(`../../packages/${name}/src`, import.meta.url))
}

export default defineConfig({
  resolve: {
    alias: {
      // system 含 CSS 子路径（tokens.css 在包根不在 src），走 exports 解析，不设 src 别名
      '@xihan-ui/core': pkg('core'),
      '@xihan-ui/machine': pkg('machine'),
      '@xihan-ui/behavior': pkg('behavior'),
      '@xihan-ui/headless': pkg('headless'),
      '@xihan-ui/position': pkg('position'),
      '@xihan-ui/wc': pkg('wc'),
    },
  },
  server: { port: 5200 },
})
