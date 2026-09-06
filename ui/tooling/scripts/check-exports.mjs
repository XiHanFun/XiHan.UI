#!/usr/bin/env node
// 门禁：实现了的东西必须从包级入口导出。
//
// 组件写完、部件也接上了，唯独忘了在 index 里加一行导出——包外拿不到它，
// 而编译、类型检查、组件自己的行为测试全都照过。qr-code 的 logo 部件就这么漏过：
// 一致性判据按名字去注册表找组件，找不到才报「适配器缺组件」，
// 得跑到那一条用例才暴露。这道门禁把它提前到构建前的一次静态比对。
//
// 三个适配器各有各的「拿得到」：vue 与 react 是包级 index 的导出，wc 是自定义元素注册表。
// react 正在按批次铺开，只核 react-coverage.json 登记为已铺的组件。
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import { ADAPTERS, reactCovered, reactProgress } from './lib/adapters.mjs'

const VUE_COMPONENTS = ADAPTERS.vue.components
const VUE_SRC = `${ADAPTERS.vue.root}/src`
const VUE_INDEX = `${ADAPTERS.vue.root}/src/index.ts`
const REACT_COMPONENTS = ADAPTERS.react.components
const REACT_SRC = `${ADAPTERS.react.root}/src`
const REACT_INDEX = `${ADAPTERS.react.root}/src/index.ts`
const WC_ELEMENTS = ADAPTERS.wc.components
const WC_DEFINE = `${ADAPTERS.wc.root}/src/define.ts`
const HEADLESS_SRC = 'packages/engine/headless/src'
const HEADLESS_INDEX = 'packages/engine/headless/src/index.ts'

/**
 * 只在包内使用、不打算对外的名字，逐条写明理由。
 * 键是模块说明符（如 './components/foo'），值是该模块里不对外的名字数组。
 * 每条都要真被用来放行过一次——文件没了、名字改了，登记就成了没人走的死条目，
 * 由下面的名单核验报出来。
 */
const EXEMPT = {
  vue: {},
  react: {},
  headless: {},
}

const RE_REEXPORT = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
const RE_VUE_COMPONENT = /^export const (Xh\w+)/gm
// react 的组件是函数声明，hook 与内部接线口不带 Xh 前缀，跟 vue 侧一样只收组件名
const RE_REACT_COMPONENT = /^export (?:function|const) (Xh\w+)/gm
const RE_WC_ELEMENT = /^export class (Xh\w*Element)\b/gm
const RE_DEFINE_CALL = /defineElement\(\s*['"][^'"]*['"]\s*,\s*(Xh\w+)/g

async function read(path) {
  return readFile(path, 'utf8')
}

/** 报错里的路径一律用正斜杠，跟脚本里写死的入口路径对得上。 */
function posix(path) {
  return path.replaceAll('\\', '/')
}

/** 把字符下标换成 1 起的行号。 */
function lineOf(source, index) {
  let line = 1
  for (let i = 0; i < index; i++) {
    if (source[i] === '\n')
      line++
  }
  return line
}

/**
 * 拆 `export { A, B } from './x'` 与 `export type { T } from './x'`：
 * 值与类型分两个桶，另外记下每个模块说明符出现在哪一行，好把「加到哪」说清楚。
 */
function parseReExports(source) {
  const values = new Map()
  const types = new Map()
  const lineBySpecifier = new Map()
  for (const match of source.matchAll(RE_REEXPORT)) {
    const isType = Boolean(match[1])
    const line = lineOf(source, match.index)
    const bucket = isType ? types : values
    for (const raw of match[2].split(',')) {
      const name = raw.trim().replace(/^type\s+/, '')
      if (name)
        bucket.set(name, line)
    }
    lineBySpecifier.set(`${isType ? 'type' : 'value'} ${match[3]}`, line)
  }
  return { values, types, lineBySpecifier }
}

/** 收集目录下所有 .ts / .tsx 文件，路径相对仓库根，含子目录。 */
async function collectTs(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      found.push(...await collectTs(path))
    else if (/\.tsx?$/.test(entry.name))
      found.push(path)
  }
  return found
}

/** 从 index 的角度看某个文件该写成什么模块说明符。 */
function specifierOf(fromDir, file) {
  const rel = posix(relative(fromDir, file)).replace(/\.tsx?$/, '')
  return `./${rel.replace(/\/index$/, '')}`
}

/**
 * 库里一共有多少个组件：vue 组件目录下既有 <名>/ 目录也有平铺的 <名>.ts，两种都算。
 * 用来给 React 的铺开进度当分母。
 */
async function componentTotal() {
  const entries = await readdir(VUE_COMPONENTS, { withFileTypes: true })
  const names = new Set()
  for (const entry of entries) {
    if (entry.isDirectory())
      names.add(entry.name)
    else if (entry.name.endsWith('.ts'))
      names.add(entry.name.replace(/\.ts$/, ''))
  }
  return names.size
}

/** 指出该往哪加：同一模块已有导出就报那一行，否则说明要新起一条。 */
function hint(index, key, fallback) {
  const line = index.lineBySpecifier.get(key)
  return line ? `加到 ${fallback}:${line} 那条导出里` : `${fallback} 里还没有 ${key.split(' ')[1]} 的导出，需新增一条`
}

const problems = []
/** 真的用来放行过的名字，写成「侧 模块说明符 名字」。 */
const usedExempt = new Set()
let vueCount = 0
let reactCount = 0
let wcCount = 0
let headlessCount = 0
/** React 侧已经铺到的组件，没铺到的这轮不核。 */
const covered = await reactCovered()

// 一、vue 组件部件必须能从包级 index 取到
{
  const index = parseReExports(await read(VUE_INDEX))
  for (const file of await collectTs(VUE_COMPONENTS)) {
    const source = await read(file)
    const specifier = specifierOf(VUE_SRC, file)
    for (const match of source.matchAll(RE_VUE_COMPONENT)) {
      const name = match[1]
      if (EXEMPT.vue[specifier]?.includes(name)) {
        usedExempt.add(`vue ${specifier} ${name}`)
        continue
      }
      vueCount++
      if (index.values.has(name))
        continue
      const where = hint(index, `value ${specifier}`, VUE_INDEX)
      problems.push(`${posix(file)}:${lineOf(source, match.index)} 的 ${name} 没从 ${VUE_INDEX} 导出——${where}`)
    }
  }
}

// 二、react 组件部件必须能从包级 index 取到，只核 react-coverage.json 登记为已铺的组件
{
  const index = parseReExports(await read(REACT_INDEX))
  for (const comp of [...covered].sort()) {
    let files
    try {
      files = await collectTs(join(REACT_COMPONENTS, comp))
    }
    catch {
      // 登记了却没有目录，由 check-react-coverage 报出来，这里不重复判
      continue
    }
    for (const file of files) {
      const source = await read(file)
      const specifier = specifierOf(REACT_SRC, file)
      for (const match of source.matchAll(RE_REACT_COMPONENT)) {
        const name = match[1]
        if (EXEMPT.react[specifier]?.includes(name)) {
          usedExempt.add(`react ${specifier} ${name}`)
          continue
        }
        reactCount++
        if (index.values.has(name))
          continue
        const where = hint(index, `value ${specifier}`, REACT_INDEX)
        problems.push(`${posix(file)}:${lineOf(source, match.index)} 的 ${name} 没从 ${REACT_INDEX} 导出——${where}`)
      }
    }
  }
}

// 三、wc 元素类必须注册过自定义元素（自定义元素注册表只有 WC 有，react 与 vue 不在其列）
{
  const define = await read(WC_DEFINE)
  const defined = new Set([...define.matchAll(RE_DEFINE_CALL)].map(m => m[1]))
  const lastCall = [...define.matchAll(RE_DEFINE_CALL)].at(-1)
  const anchor = lastCall ? `${WC_DEFINE}:${lineOf(define, lastCall.index)}` : WC_DEFINE
  for (const file of await collectTs(WC_ELEMENTS)) {
    const source = await read(file)
    const tag = `xh-${posix(file).split('/').at(-1).replace(/\.ts$/, '')}`
    for (const match of source.matchAll(RE_WC_ELEMENT)) {
      const name = match[1]
      wcCount++
      if (defined.has(name))
        continue
      problems.push(`${posix(file)}:${lineOf(source, match.index)} 的 ${name} 没注册——把 defineElement('${tag}', ${name}, VERSION) 加进 ${anchor} 所在的 defineXhElements`)
    }
  }
}

// 四、headless 子入口导出的名字必须在包级 index 再导一次
{
  const index = parseReExports(await read(HEADLESS_INDEX))
  for (const entry of await readdir(HEADLESS_SRC, { withFileTypes: true })) {
    if (!entry.isDirectory())
      continue
    const file = join(HEADLESS_SRC, entry.name, 'index.ts')
    let source
    try {
      source = await read(file)
    }
    catch {
      continue
    }
    const sub = parseReExports(source)
    const specifier = `./${entry.name}`
    for (const [kind, subBucket, rootBucket] of [
      ['value', sub.values, index.values],
      ['type', sub.types, index.types],
    ]) {
      for (const [name, line] of subBucket) {
        if (EXEMPT.headless[specifier]?.includes(name)) {
          usedExempt.add(`headless ${specifier} ${name}`)
          continue
        }
        headlessCount++
        if (rootBucket.has(name))
          continue
        const where = hint(index, `${kind} ${specifier}`, HEADLESS_INDEX)
        const as = kind === 'type' ? '类型' : '值'
        problems.push(`${posix(file)}:${line} 的${as} ${name} 没从 ${HEADLESS_INDEX} 导出——${where}`)
      }
    }
  }
}

// 名单核验：登记了却没被扫到，说明这条豁免已经没有对应的实现，删掉
for (const side of ['vue', 'react', 'headless']) {
  for (const [specifier, names] of Object.entries(EXEMPT[side])) {
    for (const name of names) {
      if (!usedExempt.has(`${side} ${specifier} ${name}`))
        problems.push(`EXEMPT.${side} 里 ${specifier} 的 ${name} 登记了却没被扫到——名单过期了`)
    }
  }
}

if (problems.length) {
  console.error('[check-exports] ✗ 实现了但没导出：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('包外拿不到的东西等于没做——补上导出，或者把它从实现里删掉。')
  process.exit(1)
}

console.log(`[check-exports] 通过：vue ${vueCount} 个部件、react ${reactCount} 个部件（${reactProgress(covered, await componentTotal())}，没铺到的不核）、wc ${wcCount} 个元素、headless ${headlessCount} 个名字都导出了（不对外 ${usedExempt.size} 个）`)
