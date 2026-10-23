import { defineXihanPackage, useClientDirective } from '@xihan-ui/build'

export default defineXihanPackage({
  unbundle: true,
  entry: {
    index: 'src/index.ts',
    backgrounds: 'src/backgrounds.tsx',
    behavior: 'src/behavior.ts',
    locale: 'src/locale.ts',
    sound: 'src/sound.ts',
  },
  neverBundle: ['react', 'react-dom', 'react/jsx-runtime'],
  // 用到客户端能力的模块带 'use client'，Next.js App Router 的服务端组件可以直接导入
  overrides: { plugins: [useClientDirective()] },
})
