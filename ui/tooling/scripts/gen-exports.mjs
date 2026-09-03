#!/usr/bin/env node
// 构建后按各包 tsdown.config.ts 里 entry 声明的入口回写 package.json 的 exports 字段；缺 dist 的包跳过。
import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

const PKG_DIR = 'packages'

async function exists(p) {
  try { await stat(p); return true }
  catch { return false }
}

/** packages/<角色组>/<包>：两级。按一级枚举一个包都找不到。 */
async function packageDirs() {
  const out = []
  for (const group of await readdir(PKG_DIR, { withFileTypes: true }).catch(() => [])) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PKG_DIR, group.name), { withFileTypes: true })) {
      if (leaf.isDirectory())
        out.push(join(PKG_DIR, group.name, leaf.name))
    }
  }
  return out
}

const dirs = await packageDirs()
if (dirs.length === 0) {
  console.error(`[gen-exports] ✗ 一个包都没找到，${PKG_DIR}/ 的目录层级变了`)
  process.exit(1)
}

/**
 * 不由 entry 表推导的子入口：样式表、清单文件这类手写条目。
 * 登记了却在该包的 exports 里找不到，就是名单过期，报错。
 */
const HANDWRITTEN = {
  '@xihan-ui/tokens': ['./tokens.css', './tokens.json'],
  '@xihan-ui/web-components': ['./custom-elements.json'],
}

/**
 * 不走 tsdown 构建的包：exports 整份手写，本脚本不改它们。
 * 登记了却带着 tsdown.config.ts，或者没登记却又缺 tsdown.config.ts，两种都报错。
 */
const NO_TSDOWN = {
  '@xihan-ui/icons': '产物由 build/build-icons.mjs 出，扩展名是 .mjs / .d.mts',
  '@xihan-ui/styles': '只出 CSS，没有 JS 产物',
}

/** 主入口排在最前：exports 是有序的，`.` 落到别的子入口后面会让人读不出哪个是主入口。 */
const entryOrder = (a, b) => (a === 'index' ? -1 : b === 'index' ? 1 : a.localeCompare(b))

const problems = []
const removed = []
const seenPackages = new Set()
const noTsdownSeen = new Set()
const handwrittenSeen = new Set()
let touched = 0

for (const dir of dirs) {
  const pkgJsonPath = join(dir, 'package.json')
  let pkg
  try {
    pkg = JSON.parse(await readFile(pkgJsonPath, 'utf8'))
  }
  catch {
    continue
  }
  seenPackages.add(pkg.name)

  const configPath = join(dir, 'tsdown.config.ts')
  const hasConfig = await exists(configPath)

  if (pkg.name in NO_TSDOWN) {
    noTsdownSeen.add(pkg.name)
    if (hasConfig)
      problems.push(`${pkg.name}：登记在 NO_TSDOWN 里，却有 tsdown.config.ts——名单过期了`)
    continue
  }
  if (!hasConfig) {
    problems.push(`${pkg.name}：没有 tsdown.config.ts，取不到入口表；整份手写 exports 的包登记进 NO_TSDOWN`)
    continue
  }

  const dist = join(dir, 'dist')
  if (!(await exists(dist)))
    continue
  const files = await readdir(dist)

  // 入口表是 exports 的唯一来源：unbundle 会按源文件切出内部块，这些块同样有 .js 与 .d.ts，
  // 只看 dist 里有什么会把它们一并写成公开子入口
  const config = (await import(pathToFileURL(resolve(configPath)).href)).default
  if (Array.isArray(config) || typeof config?.entry !== 'object' || config.entry === null || Array.isArray(config.entry)) {
    problems.push(`${pkg.name}：tsdown.config.ts 的 entry 不是「产物名 → 源文件」的对象，取不到入口名`)
    continue
  }
  const needTypes = config.dts !== false

  const exportsMap = {}
  let broken = false
  for (const name of Object.keys(config.entry).sort(entryOrder)) {
    const hasJs = files.includes(`${name}.js`)
    const hasDts = files.includes(`${name}.d.ts`)
    if (!hasJs || (needTypes && !hasDts)) {
      problems.push(`${pkg.name}：入口 ${name} 在 dist 里缺${!hasJs ? ` ${name}.js` : ''}${needTypes && !hasDts ? ` ${name}.d.ts` : ''}`)
      broken = true
      continue
    }
    const key = name === 'index' ? '.' : `./${name}`
    exportsMap[key] = hasDts
      ? { types: `./dist/${name}.d.ts`, import: `./dist/${name}.js` }
      : { import: `./dist/${name}.js` }
  }
  if (broken)
    continue

  // 手写的子入口（令牌的 CSS / JSON、WC 的清单）在入口表里没有对应条目，整表覆盖会把它们抹掉
  for (const key of HANDWRITTEN[pkg.name] ?? []) {
    if (!(key in (pkg.exports ?? {}))) {
      problems.push(`${pkg.name}：HANDWRITTEN 登记的 ${key} 在它的 exports 里没有——名单过期了`)
      broken = true
      continue
    }
    handwrittenSeen.add(`${pkg.name} ${key}`)
    exportsMap[key] = pkg.exports[key]
  }
  if (broken)
    continue

  const gone = Object.keys(pkg.exports ?? {}).filter(k => !(k in exportsMap))
  if (gone.length)
    removed.push(`${pkg.name}：${gone.join(' ')}`)

  if (JSON.stringify(pkg.exports) === JSON.stringify(exportsMap))
    continue
  pkg.exports = exportsMap
  await writeFile(pkgJsonPath, `${JSON.stringify(pkg, null, 2)}\n`)
  touched++
}

// 登记表的过期反查：登记的包名仓里没有就是名单过期。
// 「包在、条目不在」那一半在上面逐包比对时已经报了。
for (const name of Object.keys(NO_TSDOWN)) {
  if (!noTsdownSeen.has(name))
    problems.push(`${name}：登记在 NO_TSDOWN 里，仓里却没有这个包——名单过期了`)
}
for (const name of Object.keys(HANDWRITTEN)) {
  if (!seenPackages.has(name))
    problems.push(`${name}：登记在 HANDWRITTEN 里，仓里却没有这个包——名单过期了`)
}

if (problems.length) {
  console.error('[gen-exports] ✗ 下列包的 exports 没能算出来，已跳过、未写入：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

if (removed.length) {
  console.log('[gen-exports] 下列子入口不在 tsdown 的 entry 表里，已从 exports 移除：')
  for (const r of removed)
    console.log(`  ${r}`)
}

console.log(`[gen-exports] 更新 ${touched} 个包的 exports（手写子入口 ${handwrittenSeen.size} 条按原样保留 · 整份手写的包 ${noTsdownSeen.size} 个不动）`)
