#!/usr/bin/env node
// 采集全部公开面，产出 tooling/public-surface.json。
//
// 采集的是「使用者能写下来的名字」，跨五种介质：JS/TS 导出、解剖属性、data-* 状态属性、
// CSS 令牌与层名、自定义元素标签与 attribute。这份产物入库，由 check-public-surface
// 拿它当基线比对——**基线里有而当前没有，就是删了或改名了，一律失败**。
//
// 为什么需要它：仓里其余门禁全是「重新生成 + git diff --exit-code」形态，只能发现
// 「改了源忘了跑生成」。改名会在同一个提交里同时改源与产物，diff 干净、CI 全绿。
// 实测把 switch 的 thumb 改名 knob，12 道 gate 加 boundaries 全部通过。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES = 'packages'
const HEADLESS = 'packages/engine/headless/src'
const SKINS = 'packages/design/styles/css'
const TOKENS = 'packages/design/tokens/tokens.json'
const WC_CEM = 'packages/adapters/web-components/custom-elements.json'
const OUT = 'tooling/public-surface.json'

const sorted = set => [...set].sort()

/** 两级目录下的全部包。 */
async function packageDirs() {
  const out = []
  for (const group of await readdir(PACKAGES, { withFileTypes: true })) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PACKAGES, group.name), { withFileTypes: true })) {
      if (leaf.isDirectory())
        out.push(join(PACKAGES, group.name, leaf.name))
    }
  }
  return out
}

// ── 一、包与子入口 ──
const packages = {}
for (const dir of await packageDirs()) {
  let pkg
  try {
    pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
  }
  catch {
    continue
  }
  if (pkg.private)
    continue
  packages[pkg.name] = sorted(new Set(Object.keys(pkg.exports ?? {})))
}

// ── 二、JS/TS 导出名 ──
// 从各包已构建的 .d.ts 里抓，而不是从源码：产物才是使用者拿到的那一份。
const exportsByPackage = {}
for (const dir of await packageDirs()) {
  let pkg
  try {
    pkg = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
  }
  catch {
    continue
  }
  if (pkg.private)
    continue
  const names = new Set()
  for (const [sub, target] of Object.entries(pkg.exports ?? {})) {
    const types = typeof target === 'object' ? target.types : null
    if (!types)
      continue
    let dts
    try {
      dts = await readFile(join(dir, types), 'utf8')
    }
    catch {
      continue
    }
    // `export { a, b as c }` 与 `export declare const x` 两种形态
    for (const m of dts.matchAll(/^export \{([^}]*)\}/gm)) {
      for (const piece of m[1].split(',')) {
        const name = piece.trim().split(/\s+as\s+/).pop()?.trim()
        if (name && name !== 'type')
          names.add(name.replace(/^type\s+/, ''))
      }
    }
    for (const m of dts.matchAll(/^export declare (?:const|function|class|abstract class) (\w+)/gm))
      names.add(m[1])
    for (const m of dts.matchAll(/^(?:export )?(?:declare )?(?:type|interface) (\w+)/gm))
      names.add(m[1])
    void sub
  }
  exportsByPackage[pkg.name] = sorted(names)
}

// ── 三、解剖：data-scope 与 data-part ──
const anatomy = {}
for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const file = join(HEADLESS, entry.name, `${entry.name}.anatomy.ts`)
  let src
  try {
    src = await readFile(file, 'utf8')
  }
  catch {
    continue
  }
  const call = src.match(/createAnatomy\(\s*'([^']+)'\s*,\s*\[([^\]]*)\]/s)
  if (!call)
    continue
  anatomy[call[1]] = sorted(new Set([...call[2].matchAll(/'([^']+)'/g)].map(m => m[1])))
}

// ── 四、connect 产出的 data-* 属性名 ──
const dataAttrs = new Set()
for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
  if (!entry.isDirectory())
    continue
  const file = join(HEADLESS, entry.name, `${entry.name}.connect.ts`)
  let src
  try {
    src = await readFile(file, 'utf8')
  }
  catch {
    continue
  }
  for (const m of src.matchAll(/'(data-[a-z0-9-]+)'\s*:/g))
    dataAttrs.add(m[1])
}

// ── 五、CSS：令牌名、@layer 名、组件覆盖槽 ──
const tokens = sorted(new Set(Object.keys(JSON.parse(await readFile(TOKENS, 'utf8')))))
const layers = new Set()
const slots = new Set()
const stateValues = new Set()
for (const file of await readdir(SKINS)) {
  if (!file.endsWith('.css'))
    continue
  const css = await readFile(join(SKINS, file), 'utf8')
  for (const m of css.matchAll(/@layer\s+([a-z.,\s]+)\{?/g)) {
    for (const name of m[1].split(',').map(s => s.trim()).filter(Boolean))
      layers.add(name)
  }
  // 使用者可覆盖的槽：var(--xh-<组件>-…, 兜底) 里第一个参数。
  // 私有槽 --xh-_xxx 自动被排除——名字里的 `_` 不在 [a-z0-9-] 里，匹配到那一位就断了。
  for (const m of css.matchAll(/var\((--xh-[a-z0-9-]+),/g))
    slots.add(m[1])
  for (const m of css.matchAll(/\[data-state=['"]([a-z0-9-]+)['"]\]/g))
    stateValues.add(m[1])
}

// ── 六、自定义元素标签与 attribute ──
const elements = {}
try {
  const cem = JSON.parse(await readFile(WC_CEM, 'utf8'))
  for (const mod of cem.modules ?? []) {
    for (const decl of mod.declarations ?? []) {
      if (!decl.tagName)
        continue
      elements[decl.tagName] = {
        attributes: sorted(new Set((decl.attributes ?? []).map(a => a.name))),
        events: sorted(new Set((decl.events ?? []).map(e => e.name))),
      }
    }
  }
}
catch {
  // CEM 还没生成时不阻断采集
}

const surface = {
  $comment: '公开面基线。由 build-public-surface.mjs 采集，check-public-surface.mjs 比对。基线里有而当前没有 = 删了或改名了，门禁失败。判据与分档见 docs/guide/versioning.md。',
  packages,
  exports: exportsByPackage,
  anatomy,
  dataAttributes: sorted(dataAttrs),
  dataStateValues: sorted(stateValues),
  tokens,
  cssLayers: sorted(layers),
  cssSlots: sorted(slots),
  elements,
}

await writeFile(OUT, `${JSON.stringify(surface, null, 2)}\n`)

const count = o => Object.values(o).reduce((n, v) => n + (Array.isArray(v) ? v.length : 1), 0)
console.log(`[build-public-surface] 已写入 ${OUT}`)
console.log(`  包 ${Object.keys(packages).length} 个 · 子入口 ${count(packages)} 条`)
console.log(`  导出名 ${count(exportsByPackage)} 个`)
console.log(`  解剖 ${Object.keys(anatomy).length} 个 scope · 部件配对 ${count(anatomy)} 条`)
console.log(`  data-* 属性 ${surface.dataAttributes.length} 种 · data-state 取值 ${surface.dataStateValues.length} 个`)
console.log(`  令牌 ${tokens.length} 个 · @layer ${surface.cssLayers.length} 个 · 组件槽 ${surface.cssSlots.length} 个`)
console.log(`  自定义元素 ${Object.keys(elements).length} 个`)
