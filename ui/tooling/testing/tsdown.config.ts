import { defineXihanPackage } from '@xihan-ui/build'

export default defineXihanPackage({
  entry: {
    'index': 'src/index.ts',
    'a11y': 'src/a11y/index.ts',
    'position': 'src/position/index.ts',
    'ssr': 'src/ssr/index.ts',
    'browser-commands': 'src/browser-commands.ts',
  },
  // browser-commands 只从 vitest 与 playwright provider 取类型：它们是开发依赖，
  // 不点名 external 的话 .d.ts 打包会顺着 vitest/node 把整个 vite 的声明吞进来
  neverBundle: [/^vitest(?:\/|$)/, /^@vitest\//, /^playwright(?:\/|$)/],
})
