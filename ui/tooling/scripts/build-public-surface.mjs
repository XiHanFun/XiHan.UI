#!/usr/bin/env node
// 采集全部公开面，产出 tooling/public-surface.json。
//
// 采集的是「使用者能写下来的名字」，跨六种介质：JS/TS 导出、解剖属性、组件 props 名、
// data-* 状态属性、CSS 令牌与层名、自定义元素标签与 attribute。这份产物入库，由
// check-public-surface 拿它当基线比对——**基线里有而当前没有，就是删了或改名了，一律失败**。
//
// 为什么需要它：仓里其余门禁全是「重新生成 + git diff --exit-code」形态，只能发现
// 「改了源忘了跑生成」。改名会在同一个提交里同时改源与产物，diff 干净、CI 全绿。
// 实测把 switch 的 thumb 改名 knob，12 道 gate 加 boundaries 全部通过。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import ts from 'typescript'

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
    // export 不可省：产物里同样躺着没导出的内部类型别名（打包版 d.ts 会把它们内联进来），
    // 少了这个词就会把「使用者根本 import 不到的名字」也算进受 semver 约束的公开面
    for (const m of dts.matchAll(/^export (?:declare )?(?:type|interface) (\w+)/gm))
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
  const call = src.match(/createAnatomy\(\s*'([^']+)'\s*,\s*\[([^\]]*)\]/)
  if (!call)
    continue
  anatomy[call[1]] = sorted(new Set([...call[2].matchAll(/'([^']+)'/g)].map(m => m[1])))
}

// ── 三点五、组件 props 名 ──
//
// 事实源取 headless 的 <组件>Schema['props'] 与 <组件>Props 的并集——两个适配器的 props 都是照它铺的。
// 没有机器的组件只有后者；机器 props 与视图 props 分开写的组件两份都有，两份都是使用者写得下来的名字。
//
// 走类型检查器而不是读语法树：popconfirm 与 float-button 的 props 是
// `Omit<PopoverSchema['props'], …> & …` 这样的类型别名，只认 interface 的读法会把它们整个漏掉，
// 而且是静默漏掉。解析不出成员的组件一律报错，不允许有「采不到就跳过」的口子。
const componentProps = {}
{
  const typeFiles = []
  for (const entry of await readdir(HEADLESS, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    const file = join(HEADLESS, entry.name, `${entry.name}.types.ts`)
    if (await readFile(file, 'utf8').then(() => true, () => false))
      typeFiles.push({ component: entry.name, file: resolve(file) })
  }

  const program = ts.createProgram(typeFiles.map(t => t.file), {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    skipLibCheck: true,
    strict: false,
  })
  const checker = program.getTypeChecker()

  /** 类型上的全部成员名；解析不出来返回空集。 */
  const propsOf = (typeNode) => {
    const type = checker.getTypeAtLocation(typeNode)
    return new Set(checker.getPropertiesOfType(type).map(s => s.name))
  }

  const unresolved = []
  for (const { component, file } of typeFiles) {
    const sf = program.getSourceFile(file)
    if (!sf) {
      unresolved.push(`${component}（类型文件没进编译单元）`)
      continue
    }
    const pascal = component.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase())
    let names = null
    let fallback = null
    ts.forEachChild(sf, (node) => {
      if (ts.isInterfaceDeclaration(node) && node.name.text === `${pascal}Schema`) {
        for (const member of node.members) {
          if (ts.isPropertySignature(member) && member.name.getText(sf) === 'props' && member.type)
            names = propsOf(member.type)
        }
      }
      // 没有机器的组件把 props 单独写成接口或类型别名；两份都在时是机器 props 与视图 props 分开写，
      // 使用者两份都写得下来，公开面取并集
      const isPropsDecl = (ts.isInterfaceDeclaration(node) || ts.isTypeAliasDeclaration(node))
        && node.name.text === `${pascal}Props`
      if (isPropsDecl)
        fallback = propsOf(ts.isTypeAliasDeclaration(node) ? node.type : node.name)
    })

    const resolved = names?.size || fallback?.size
      ? new Set([...(names ?? []), ...(fallback ?? [])])
      : null
    if (!resolved?.size) {
      unresolved.push(component)
      continue
    }
    componentProps[component] = sorted(resolved)
  }

  if (unresolved.length) {
    console.error(`[build-public-surface] ✗ 这些组件的 props 解析不出来，公开面会缺这一块：${unresolved.join('、')}`)
    console.error('  props 的事实源是 <组件>Schema[\'props\'] 或 <组件>Props；换了写法就把这里的读法一起改。')
    process.exit(1)
  }
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

  // 常量形态：先 export const X = 'data-y'，再以 [X]: … 当计算键用
  const anatomyFile = join(HEADLESS, entry.name, `${entry.name}.anatomy.ts`)
  let decls = src
  try {
    decls += await readFile(anatomyFile, 'utf8')
  }
  catch {
    // 没有 anatomy 就只看 connect 自己声明的常量
  }
  const constants = new Map()
  for (const m of decls.matchAll(/(?:export\s+)?const\s+([A-Z][A-Z0-9_]*)\s*=\s*'(data-[a-z0-9-]+)'/g))
    constants.set(m[1], m[2])
  for (const m of src.matchAll(/\[([A-Z][A-Z0-9_]*)\]\s*:/g)) {
    const attr = constants.get(m[1])
    if (attr != null)
      dataAttrs.add(attr)
  }
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
  componentProps,
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
console.log(`  组件 props ${Object.keys(componentProps).length} 个组件 · ${count(componentProps)} 个名字`)
console.log(`  data-* 属性 ${surface.dataAttributes.length} 种 · data-state 取值 ${surface.dataStateValues.length} 个`)
console.log(`  令牌 ${tokens.length} 个 · @layer ${surface.cssLayers.length} 个 · 组件槽 ${surface.cssSlots.length} 个`)
console.log(`  自定义元素 ${Object.keys(elements).length} 个`)
