#!/usr/bin/env node
// 门禁：文档站里的 React 示例必须能通过类型检查。
//
// 文档站按 `?raw` 把示例当字符串读，Vite 一个字都不编译——一份语法崩了的 .tsx 照样能
// build 成功，传错 prop、引不存在的导出、用不存在的 hook 也全程静默。照抄的人拿到手才发现跑不起来。
//
// Vue 与 Web Components 那两档不在其列：.vue 由文档站真正编译并挂载，坏了 build 当场失败；
// .html 是纯标记，没有类型可言。只有 .tsx 这一档既不编译也没人核。
//
// 判据用 packages/adapters/react/tsconfig.demos.json，对着**源码**（不是 dist）校验，
// 所以不必先 build。零份示例也判失败——示例被挪走或 include 写错时，这张门禁不能悄悄变成空跑。
import { spawnSync } from 'node:child_process'
import { readdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const reactPkg = join(uiRoot, 'packages/adapters/react')
const demosDir = join(uiRoot, '..', 'docs/.vitepress/demos')
const CONFIG = 'tsconfig.demos.json'

/** 各组件目录下的 .tsx 示例份数。 */
async function countDemos() {
  let n = 0
  for (const entry of await readdir(demosDir, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    for (const file of await readdir(join(demosDir, entry.name))) {
      if (file.endsWith('.tsx'))
        n++
    }
  }
  return n
}

const count = await countDemos()
if (count === 0) {
  console.error('[check-demo-types] ✗ 一份 .tsx 示例都没找到——示例被挪走了，或 tsconfig.demos.json 的 include 写错了')
  process.exit(1)
}

// 直接用 node 跑 tsc 的入口，不经 shell：参数不必转义，Windows 与 POSIX 走同一条路
const run = spawnSync(
  process.execPath,
  [join(uiRoot, 'node_modules/typescript/bin/tsc'), '--noEmit', '-p', CONFIG],
  { cwd: reactPkg, encoding: 'utf8' },
)

const output = `${run.stdout ?? ''}${run.stderr ?? ''}`.trim()

if (run.status !== 0) {
  console.error(`[check-demo-types] ✗ React 示例没通过类型检查（${count} 份）：\n`)
  console.error(output)
  console.error('\n改法：按 packages/adapters/react/src 里各组件的 Xh*Props 改正示例，'
    + '别照 Vue 版的 props 名猜。集合型 Root 是封闭 props 列表，style / className 落不上去，要套一层壳。')
  process.exit(1)
}

console.log(
  `[check-demo-types] 通过：${count} 份 React 示例对着适配器源码逐份类型检查。`
  + 'Vue 与 Web Components 不在其列——.vue 由文档站真正编译，.html 是纯标记',
)
