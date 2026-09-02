import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    'index': 'src/index.ts',
    'skin-check': 'src/diagnostics/skin-check.ts',
    'metadata': 'src/metadata.ts',
    // 只给 Node 侧用（构建工具进程），不从 index 再导出，浏览器产物里不会有它
    'vite': 'src/vite.ts',
  },
})
