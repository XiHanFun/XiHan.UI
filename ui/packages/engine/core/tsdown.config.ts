import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    'index': 'src/index.ts',
    'metadata': 'src/kernel/metadata.ts',
    'skin-check': 'src/kernel/diagnostics/skin-check.ts',
    // 只给 Node 侧用（构建工具进程），不从 index 再导出，浏览器产物里不会有它
    'vite': 'src/kernel/vite.ts',
    'vanilla': 'src/machine/vanilla.ts',
    'presence': 'src/behavior/presence.ts',
  },
})
