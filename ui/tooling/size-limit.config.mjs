// size-limit 的配置入口：条目照旧写在 .size-limit.json（别的门禁也读它），这里只给 JS 条目补一条打包规则——
// 动态 import() 的目标当外部模块，不算进本条体积。
//
// 为什么：size-limit 的 esbuild 不分块，import() 指向的模块会被原样并进同一个包。可消费方的打包器（Vite / Rollup /
// webpack）都会把它切成按需块，首屏不下载：选择器的标准结构开了 virtual 才加载虚拟化内核，没开的组件不付这份体积。
// 不排除的话「只用 XhSelectRoot」量出来的是「选择器 + 所有按需块」，与使用者首屏实际下载的对不上，
// 按需拆分也就在预算上看不出效果。按需块自己另记一条（见 .size-limit.json 里「按需块」那几条），一样受预算管。

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const UI_ROOT = new URL('../', import.meta.url)
const entries = JSON.parse(readFileSync(new URL('.size-limit.json', UI_ROOT), 'utf8'))
/** .size-limit.json 里的路径相对 ui/ 写；size-limit 按配置文件所在目录 glob，这里换成正斜杠的绝对路径。 */
const absolute = path => fileURLToPath(new URL(path, UI_ROOT)).replaceAll('\\', '/')

/** 把动态 import() 的目标留在包外：只量首屏同步加载的那一份。 */
const lazyChunksExternal = {
  name: 'lazy-chunks-external',
  setup(build) {
    build.onResolve({ filter: /.*/ }, args => (args.kind === 'dynamic-import' ? { path: args.path, external: true } : undefined))
  },
}

export default entries.map((entry) => {
  const path = Array.isArray(entry.path) ? entry.path.map(absolute) : absolute(entry.path)
  if (![entry.path].flat().every(file => file.endsWith('.js')))
    return { ...entry, path }
  return { ...entry, path, modifyEsbuildConfig: config => ({ ...config, plugins: [...(config.plugins ?? []), lazyChunksExternal] }) }
})
