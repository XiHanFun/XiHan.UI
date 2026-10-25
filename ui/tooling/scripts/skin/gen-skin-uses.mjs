#!/usr/bin/env node
// 生成 packages/design/styles/skin-uses.json：组件渲染时借来的别的组件皮肤。
//
// 按需注入样式（@xihan-ui/styles/vite）只按源码里写到的组件挑皮肤，可组件内部还会借别的组件来渲染：
// 分页里的每页条数是 Select、日期选择器里有日历与时间输入、侧栏导航收起后靠 Tooltip 显示文字。
// 这些借来的部件带的是被借组件的 data-scope，只注入外层组件的皮肤，它们就渲染成裸元素。
//
// 判据取两处源码里的值导入（import type 不算）：
//   headless：src/<组件>/ 下从 '../<别的组件>' 导入的 connect / machine / anatomy / structure——
//     只借路径工具（formArrayItemPath 一类）不渲染那个组件的部件
//   Vue 适配器：src/components/<组件>/ 下从 '../<别的组件>/<文件>' 导入，context 与 use-*-control 除外——
//     读上下文、接表单控件桥（useFormControl 一类）只是接线，不渲染那个组件的部件
// 两侧都只认有皮肤的组件（css/<名字>.css 带 --xh-<名字>-skin 标记）。多认几条只是多注入一点 CSS，
// 少认一条就是静默的裸元素，所以宁宽勿窄。
//
// 用法：node tooling/scripts/skin/gen-skin-uses.mjs [--check]
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const STYLES = 'packages/design/styles'
const OUT = `${STYLES}/skin-uses.json`
const HEADLESS = 'packages/engine/headless/src'
const VUE = 'packages/adapters/vue/src/components'
const check = process.argv.includes('--check')

const skins = new Set(readdirSync(`${STYLES}/css`)
  .filter(name => name.endsWith('.css'))
  .map(name => name.slice(0, -4))
  .filter(name => readFileSync(`${STYLES}/css/${name}.css`, 'utf8').includes(`--xh-${name}-skin: 1`)))

/** 一份源码里的值导入：去掉 import type，多行导入也认。返回导入的名字与 from 后面的路径。 */
function valueImports(source) {
  const out = []
  // 源码按格式化规则写：import 与 from 两侧各一个空格，多行导入的花括号里换行照认
  for (const match of source.matchAll(/^import (?!type\b)([^;]*?)\bfrom '([^']+)'/gm)) {
    const names = (match[1].match(/\{([^}]*)\}/)?.[1] ?? '')
      .split(',')
      .map(part => part.replace(/^\s*type\s+/, '').split(/\s+as\s+/)[0].trim())
      .filter(Boolean)
    out.push({ names, spec: match[2] })
  }
  return out
}

/** headless 里算「渲染那个组件」的导入名：connect 函数、状态机、解剖与默认结构。 */
const RENDERING = /^connect[A-Z]|(?:Machine|Anatomy|Structure)$/

const uses = new Map([...skins].sort().map(name => [name, new Set()]))

function scan(dir, owner, pick) {
  if (!existsSync(dir))
    return
  for (const file of readdirSync(dir).filter(name => /\.tsx?$/.test(name))) {
    for (const imported of valueImports(readFileSync(join(dir, file), 'utf8'))) {
      const other = pick(imported)
      if (other && other !== owner && skins.has(other))
        uses.get(owner).add(other)
    }
  }
}

for (const name of skins) {
  scan(join(HEADLESS, name), name, ({ names, spec }) => {
    const other = spec.match(/^\.\.\/([a-z][a-z0-9-]*)$/)?.[1]
    return other && names.some(imported => RENDERING.test(imported)) ? other : undefined
  })
  scan(join(VUE, name), name, ({ spec }) => {
    const match = spec.match(/^\.\.\/([a-z][a-z0-9-]*)\/([a-z0-9-]+)$/)
    return match && match[2] !== 'context' && !/^use-[a-z-]+-control$/.test(match[2]) ? match[1] : undefined
  })
}

const manifest = {
  $comment: '由 tooling/scripts/skin/gen-skin-uses.mjs 从 headless 与 Vue 适配器的导入生成，禁止手改。组件 → 它渲染时借来的别的组件皮肤；@xihan-ui/styles/vite 按需注入时据此补齐。',
  uses: Object.fromEntries([...uses].filter(([, set]) => set.size > 0).map(([name, set]) => [name, [...set].sort()])),
}
const text = `${JSON.stringify(manifest, null, 2)}\n`

if (check) {
  const current = existsSync(OUT) ? readFileSync(OUT, 'utf8') : ''
  if (current !== text) {
    console.error(`[gen-skin-uses] ✗ ${OUT} 过期：先跑 node tooling/scripts/skin/gen-skin-uses.mjs`)
    process.exit(1)
  }
  console.log(`[gen-skin-uses] 通过：${Object.keys(manifest.uses).length} 个组件的借用皮肤与源码一致`)
}
else {
  writeFileSync(OUT, text)
  console.log(`[gen-skin-uses] 已生成 ${OUT}（${Object.keys(manifest.uses).length} 个组件借用了别的皮肤）`)
}
