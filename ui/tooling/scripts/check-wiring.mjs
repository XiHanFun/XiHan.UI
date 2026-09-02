#!/usr/bin/env node
// 门禁:tooling/scripts 与 scripts 下的每个 check-*.mjs、gen-*.mjs 以及登记在 WRITES_FILES 里的生成器,
// 都必须接进 ui/package.json 的某个 script。
//
// 检查脚本的存在不等于检查在跑:写了不接线,gate 不会执行它,等于没写。生成器还要多一层——
// 它会把产物写进库里,只有一道「先生成、再 `git diff --exit-code`(或 --check 模式核对)」的
// gate:* 脚本才能让生成结果与库内文件的偏离在流水线上现形。其余门禁管库的公开面,这条管
// 检查与生成系统自己的完整性。
import { existsSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'

const SCRIPT_DIRS = ['tooling/scripts', 'scripts']
const ROOT_PKG = 'package.json'

// 免检名单:键是脚本相对路径,值是理由。名单里的条目必须真实存在,否则一并报错。
const EXEMPT = {}

const checks = new Map()
/**
 * 不叫 gen-* 但同样往库里写文件的脚本：按名字分类会把它们漏掉，
 * 而生成器写错一次就把结果永久留在库里，所以逐个登记进来一起管。
 */
const WRITES_FILES = new Set([
  'build-public-surface.mjs',
  'visual-baseline.mjs',
])

/**
 * 产物是基线快照而不是从源码派生的生成器：重跑再 diff 没有意义（推基线本来就是有意改它），
 * 由另一道读同一份产物的检查器兜住意外变化。值是那道检查器。
 *
 * 这张表放行的是「产物无人核对」那一条，所以它自己不能过期：键不再是生成器、
 * 或那道检查器的文件没了，放行就落空——下面逐条核验。
 */
const BASELINE_GUARDED = {
  'build-public-surface.mjs': 'tooling/scripts/check-public-surface.mjs',
  'visual-baseline.mjs': 'packages/adapters/vue/tests/browser/visual-baseline.spec.ts',
}

const generators = new Map()
for (const dir of SCRIPT_DIRS) {
  for (const name of await readdir(dir)) {
    if (!name.endsWith('.mjs'))
      continue
    const path = `${dir}/${name}`
    if (name.startsWith('check-')) {
      checks.set(path, name)
    }
    else if (name.startsWith('gen-') || WRITES_FILES.has(name)) {
      generators.set(path, name)
    }
  }
}

if (checks.size === 0 || generators.size === 0) {
  console.error(`[check-wiring] ✗ 扫到 ${checks.size} 个检查脚本、${generators.size} 个生成器,目录层级变了:${SCRIPT_DIRS.join(' ')}`)
  process.exit(1)
}

const root = JSON.parse(await readFile(ROOT_PKG, 'utf8'))
const entries = Object.entries(root.scripts ?? {})

/** 引用了该脚本的 script 名字;命令行里的路径按 posix 归一后按整段路径比对。 */
function referrersOf(path) {
  return entries.filter(([, body]) => normalize(body).includes(path)).map(([name]) => name)
}

function normalize(text) {
  return text.replaceAll('\\', '/').replaceAll('./', '')
}

/** 该 script 是否既属于 gate 家族,又真的核对了生成结果。 */
function isGuardingGate(name, body) {
  if (name !== 'gate' && !name.startsWith('gate:'))
    return false
  return body.includes('git diff --exit-code') || body.includes('--check')
}

const errors = []
/** 真的用来放行过的生成器。 */
const usedBaseline = new Set()

for (const [path, name] of checks) {
  if (path in EXEMPT)
    continue
  if (referrersOf(path).length === 0) {
    errors.push(referenceHint(path, name, '没接进任何 pnpm script——写了却不跑,等于没写'))
  }
}

for (const [path, name] of generators) {
  if (path in EXEMPT)
    continue
  const referrers = referrersOf(path)
  if (referrers.length === 0) {
    errors.push(referenceHint(path, name, '没接进任何 pnpm script——能手跑一次就把产物永久写进库,却没有任何门禁核对它'))
    continue
  }
  const byGate = referrers.some(ref => isGuardingGate(ref, root.scripts[ref]))
  if (!byGate && BASELINE_GUARDED[name] != null)
    usedBaseline.add(name)
  const guarded = byGate || BASELINE_GUARDED[name] != null
  if (!guarded) {
    errors.push(
      `${path} 只被 ${referrers.join(' / ')} 引用,产物无人核对`
      + '——需要一道 gate:* 脚本先跑生成器,再 `git diff --exit-code <产物路径>`(或以 --check 模式核对)',
    )
  }
}

/** 文件没被按所在路径引用时,区分「压根没接」与「接了但写的是别处的路径」。 */
function referenceHint(path, name, message) {
  const allScripts = normalize(entries.map(([, body]) => body).join(' '))
  if (allScripts.includes(name))
    return `${path} 被 script 按别的路径引用,与文件实际位置对不上`
  return `${path} ${message}`
}

// 反向:script 引用的检查与生成脚本必须存在,改名后残留的死引用在这里提前揪出
const known = new Set([...checks.keys(), ...generators.keys()])
const knownNames = new Set([...checks.values(), ...generators.values()])
for (const [name, body] of entries) {
  for (const ref of normalize(body).matchAll(/[\w/-]*(?:check|gen)-[\w-]+\.mjs/g)) {
    const target = ref[0]
    const exists = target.includes('/') ? known.has(target) : knownNames.has(target)
    if (!exists)
      errors.push(`${target} 被 script ${name} 引用但文件不存在`)
  }
}

// 基线名单自身的保鲜:键不再是生成器、或那道检查器不存在,放行就落空
for (const [name, guard] of Object.entries(BASELINE_GUARDED)) {
  if (!usedBaseline.has(name))
    errors.push(`BASELINE_GUARDED 里的 ${name} 登记了却没被扫到——名单过期了`)
  else if (!existsSync(guard))
    errors.push(`BASELINE_GUARDED 里 ${name} 指向的检查器 ${guard} 不存在,产物其实无人核对`)
}

// 免检名单自身的保鲜:文件删了或改名了,名单条目要一并清掉
for (const path of Object.keys(EXEMPT)) {
  if (!known.has(path))
    errors.push(`EXEMPT 里的 ${path} 已不存在,清掉这条`)
  else if (!EXEMPT[path]?.trim())
    errors.push(`EXEMPT 里的 ${path} 没写理由`)
}

if (errors.length > 0) {
  console.error('[check-wiring] ✗')
  for (const e of errors)
    console.error(`  ${e}`)
  process.exit(1)
}

const exempt = Object.keys(EXEMPT).length
console.log(
  `[check-wiring] 通过:${checks.size} 个检查脚本、${generators.size} 个生成器全部接入 script`
  + `${exempt > 0 ? `(${exempt} 个免检)` : ''},生成器产物均由 gate 核对(基线快照 ${usedBaseline.size} 个由检查器兜住),script 里没有死引用`,
)
