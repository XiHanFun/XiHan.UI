import type { Plugin } from 'vitest/config'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import { demoScriptPlugin } from '../../../../docs/.vitepress/demo-script'
import browser from './vitest.browser.config'

const packageRoot = fileURLToPath(new URL('.', import.meta.url))
const packagesRoot = join(packageRoot, '..', '..')

/**
 * 示例脚本里 import 的 @xihan-ui/* 钉回工作区。
 *
 * 示例住在 docs/ 下，裸说明符按 Node 解析会去找 docs/node_modules——那是文档站自己的依赖，
 * CI 跑这一步时还没装。web-components 指本包源码，与验证台 import 的 defineXhElements 是同一份实例；
 * 其余照各包 package.json 的 exports 指到 dist，与本包源码经 node_modules 解析到的是同一个文件。
 */
function demoWorkspacePackages(): Plugin {
  const dirs = new Map<string, string>()
  for (const group of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!group.isDirectory())
      continue
    for (const entry of readdirSync(join(packagesRoot, group.name), { withFileTypes: true })) {
      const manifest = join(packagesRoot, group.name, entry.name, 'package.json')
      if (entry.isDirectory() && existsSync(manifest))
        dirs.set(JSON.parse(readFileSync(manifest, 'utf8')).name, join(packagesRoot, group.name, entry.name))
    }
  }

  return {
    name: 'xihan-demo-workspace-packages',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!importer?.replaceAll('\\', '/').includes('/docs/.vitepress/demos/'))
        return null
      const matched = /^(@xihan-ui\/[^/]+)(?:\/(.+))?$/.exec(source)
      if (!matched)
        return null
      // 包名一组不带量词，匹配上就一定有值；子路径一组可缺
      const name = matched[1]!
      const subpath = matched[2]
      if (name === '@xihan-ui/web-components') {
        const file = join(packageRoot, 'src', `${subpath ?? 'index'}.ts`)
        if (!existsSync(file))
          throw new Error(`示例引了 ${source}，本包没有对应的源码入口 ${file}`)
        return file
      }
      const dir = dirs.get(name)
      if (!dir)
        throw new Error(`示例引了 ${source}，工作区里没有 ${name} 这个包`)
      const exports = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8')).exports ?? {}
      const entry = exports[subpath ? `./${subpath}` : '.']
      const target = typeof entry === 'string' ? entry : entry?.import ?? entry?.default
      if (typeof target !== 'string')
        throw new Error(`示例引了 ${source}，${name} 的 exports 里没有这个入口`)
      return join(dir, target)
    },
  }
}

// 浏览器态按项目分了主池与无障碍扫描；验证台自成一个项目，只取公共的浏览器设置，不带那两个项目
const { projects, ...browserTest } = browser.test ?? {}

// 文档站示例的验证台，浏览器设置照搬 vitest.browser.config，只换 include 与几处示例专用配置。
//
// 单开一份而不是并进 tests/browser：示例文件在 docs/ 下，不在 turbo 对 test:browser
// 声明的输入集里，只加示例不改 ui/ 时 turbo 会直接返回缓存的绿。这条走 tooling/scripts/docs/check-wc-demos.mjs
// 直接起 vitest，不经 turbo。
export default defineConfig({
  ...browser,
  // 示例的模块脚本与文档站走同一个插件编译，import 的包由下一个插件解析到工作区
  plugins: [demoScriptPlugin(), demoWorkspacePackages()],
  // 示例文件在本包之外，放行到仓库根
  server: {
    fs: { allow: ['../../../..'] },
  },
  // 组件筛选：逗号分隔的组件目录名，空串表示全跑
  define: {
    __XH_WC_DEMOS__: JSON.stringify(process.env.XH_WC_DEMOS ?? ''),
  },
  test: {
    ...browserTest,
    name: 'wc-demos',
    include: ['tests/demos/**/*.spec.ts'],
  },
})
