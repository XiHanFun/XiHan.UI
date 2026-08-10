#!/usr/bin/env node
// 门禁：实现了的东西必须从包级入口导出。
//
// 组件写完、部件也接上了，唯独忘了在 index 里加一行导出——包外拿不到它，
// 而编译、类型检查、组件自己的行为测试全都照过。qr-code 的 logo 部件就这么漏过：
// 一致性判据按名字去注册表找组件，找不到才报「适配器缺组件」，
// 得跑到那一条用例才暴露。这道门禁把它提前到构建前的一次静态比对。
import { readdir, readFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

const VUE_COMPONENTS = 'packages/vue/src/components'
const VUE_SRC = 'packages/vue/src'
const VUE_INDEX = 'packages/vue/src/index.ts'
const WC_ELEMENTS = 'packages/wc/src/elements'
const WC_DEFINE = 'packages/wc/src/define.ts'
const HEADLESS_SRC = 'packages/headless/src'
const HEADLESS_INDEX = 'packages/headless/src/index.ts'

/** 只在包内使用、不打算对外的名字，逐条写明理由。 */
const EXEMPT = {
  vue: {},
  headless: {},
}

const RE_REEXPORT = /export\s+(type\s+)?\{([^}]*)\}\s*from\s*['"]([^'"]+)['"]/g
const RE_VUE_COMPONENT = /^export const (Xh\w+)/gm
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

/** 收集目录下所有 .ts 文件，路径相对仓库根，含子目录。 */
async function collectTs(dir) {
  const found = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name)
    if (entry.isDirectory())
      found.push(...await collectTs(path))
    else if (entry.name.endsWith('.ts'))
      found.push(path)
  }
  return found
}

/** 从 index 的角度看某个文件该写成什么模块说明符。 */
function specifierOf(fromDir, file) {
  const rel = posix(relative(fromDir, file)).replace(/\.ts$/, '')
  return `./${rel.replace(/\/index$/, '')}`
}

/** 指出该往哪加：同一模块已有导出就报那一行，否则说明要新起一条。 */
function hint(index, key, fallback) {
  const line = index.lineBySpecifier.get(key)
  return line ? `加到 ${fallback}:${line} 那条导出里` : `${fallback} 里还没有 ${key.split(' ')[1]} 的导出，需新增一条`
}

const problems = []
let vueCount = 0
let wcCount = 0
let headlessCount = 0

// 一、vue 组件部件必须能从包级 index 取到
{
  const index = parseReExports(await read(VUE_INDEX))
  for (const file of await collectTs(VUE_COMPONENTS)) {
    const source = await read(file)
    const specifier = specifierOf(VUE_SRC, file)
    for (const match of source.matchAll(RE_VUE_COMPONENT)) {
      const name = match[1]
      if (EXEMPT.vue[specifier]?.includes(name))
        continue
      vueCount++
      if (index.values.has(name))
        continue
      const where = hint(index, `value ${specifier}`, VUE_INDEX)
      problems.push(`${posix(file)}:${lineOf(source, match.index)} 的 ${name} 没从 ${VUE_INDEX} 导出——${where}`)
    }
  }
}

// 二、wc 元素类必须注册过自定义元素
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

// 三、headless 子入口导出的名字必须在包级 index 再导一次
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
        if (EXEMPT.headless[specifier]?.includes(name))
          continue
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

if (problems.length) {
  console.error('[check-exports] ✗ 实现了但没导出：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('包外拿不到的东西等于没做——补上导出，或者把它从实现里删掉。')
  process.exit(1)
}

console.log(`[check-exports] 通过：vue ${vueCount} 个部件、wc ${wcCount} 个元素、headless ${headlessCount} 个名字都导出了`)
