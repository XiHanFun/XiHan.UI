#!/usr/bin/env node
// 门禁：有 tests/ 的包必须把测试代码也纳入类型检查。
//
// 各包的 tsconfig.json 只 include src/**，tsc 从不看 tests/**。改名、删导出、改签名时
// 测试代码不报错，返工被推到运行时。本脚本按包核四件事：
//   1. 有 tests/ 就要有 tsconfig.test.json；
//   2. 它 extends 本包的 tsconfig.json，不许另挑一份更松的底；
//   3. include（减去 exclude）要盖住 tests/ 下每一份 .ts；
//   4. package.json 的 typecheck 脚本要真的 `-p tsconfig.test.json` 跑它。
//
// 豁免登记在 tooling/scripts/typecheck-scope.json；表两侧都反查：登记了却已经合规、
// 或者包/tests 目录没了，都判红。
import { readdir, readFile, stat } from 'node:fs/promises'
import { join, posix } from 'node:path'
import process from 'node:process'

const PACKAGE_GLOBS = ['packages/*/*', 'tooling/*']
const REGISTRY = 'tooling/scripts/typecheck-scope.json'
const TEST_CONFIG = 'tsconfig.test.json'

/** 在 tsconfig.test.json 里写成 false 就等于给测试代码降标准。 */
const FORBIDDEN_OFF = [
  'strict',
  'noImplicitAny',
  'noUnusedLocals',
  'noUnusedParameters',
  'noUncheckedIndexedAccess',
  'noImplicitOverride',
]

/** 去掉 // 与块注释，让带注释的 tsconfig 也能 JSON.parse；字符串里的斜杠星号原样留着。 */
function stripJsonComments(text) {
  let out = ''
  let inString = false
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (inString) {
      out += ch
      if (ch === '\\') {
        out += text[++i] ?? ''
        continue
      }
      if (ch === '"')
        inString = false
      continue
    }
    if (ch === '"') {
      inString = true
      out += ch
      continue
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < text.length && text[i] !== '\n')
        i++
      out += '\n'
      continue
    }
    if (ch === '/' && text[i + 1] === '*') {
      i += 2
      while (i < text.length && !(text[i] === '*' && text[i + 1] === '/'))
        i++
      i++
      continue
    }
    out += ch
  }
  return out
}

async function readJson(path) {
  return JSON.parse(stripJsonComments(await readFile(path, 'utf8')))
}

async function exists(path) {
  try {
    await stat(path)
    return true
  }
  catch {
    return false
  }
}

/** tsconfig 的 include/exclude 通配转成正则：** 跨目录，* 与 ? 不跨。 */
function patternToRegExp(pattern) {
  let body = ''
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern[i]
    if (ch === '*') {
      if (pattern[i + 1] === '*' && pattern[i + 2] === '/') {
        body += '(?:.*/)?'
        i += 2
      }
      else if (pattern[i + 1] === '*') {
        body += '.*'
        i += 1
      }
      else {
        body += '[^/]*'
      }
    }
    else if (ch === '?') {
      body += '[^/]'
    }
    else if ('.+^${}()|[]\\/'.includes(ch)) {
      body += `\\${ch}`
    }
    else {
      body += ch
    }
  }
  return new RegExp(`^${body}$`)
}

/** tsconfig 里不带扩展名的目录式条目等价于该目录下的全部源文件。 */
function normalizePattern(pattern) {
  return /\.[^/]*$/.test(pattern) ? pattern : posix.join(pattern, '**/*')
}

function matchesAny(patterns, relPath) {
  return patterns.some(p => patternToRegExp(normalizePattern(p)).test(relPath))
}

/** 列出目录下全部文件的相对路径（posix 分隔符）。 */
async function listFiles(dir, base) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    const rel = posix.join(base, entry.name)
    if (entry.isDirectory())
      out.push(...await listFiles(full, rel))
    else
      out.push(rel)
  }
  return out
}

/** 按 pnpm-workspace 的两段 glob 展开包目录。 */
async function listPackages() {
  const dirs = []
  for (const glob of PACKAGE_GLOBS) {
    const segments = glob.split('/')
    let level = [segments[0]]
    for (const seg of segments.slice(1)) {
      const next = []
      for (const parent of level) {
        for (const entry of await readdir(parent, { withFileTypes: true })) {
          if (!entry.isDirectory())
            continue
          if (seg !== '*' && seg !== entry.name)
            continue
          next.push(posix.join(parent, entry.name))
        }
      }
      level = next
    }
    for (const dir of level) {
      if (await exists(join(dir, 'package.json')))
        dirs.push(dir)
    }
  }
  return dirs.sort()
}

const registry = await readJson(REGISTRY)
const exempt = new Map(registry.exempt.map(e => [e.package, e.why]))

const problems = []
const seenExempt = new Set()
let checkedPackages = 0
let checkedFiles = 0

for (const dir of await listPackages()) {
  const testsDir = join(dir, 'tests')
  if (!await exists(testsDir))
    continue

  const configPath = posix.join(dir, TEST_CONFIG)

  if (exempt.has(dir)) {
    seenExempt.add(dir)
    if (await exists(configPath))
      problems.push(`${configPath}:1 —— 已经有 ${TEST_CONFIG} 了，豁免登记过期，从 ${REGISTRY} 里删掉`)
    continue
  }

  const testFiles = (await listFiles(testsDir, 'tests')).filter(f => f.endsWith('.ts'))
  checkedPackages++

  if (!await exists(configPath)) {
    problems.push(
      `${configPath}:1 —— 这个包有 tests/（${testFiles.length} 份 .ts）却没有 ${TEST_CONFIG}，测试代码不做类型检查`,
    )
    continue
  }

  const config = await readJson(configPath)

  if (config.extends !== './tsconfig.json') {
    problems.push(
      `${configPath}:1 —— extends 写的是 ${JSON.stringify(config.extends)}，`
      + `要 extends "./tsconfig.json"，测试代码与源码同一套严格度`,
    )
  }

  for (const key of FORBIDDEN_OFF) {
    if (config.compilerOptions?.[key] === false)
      problems.push(`${configPath}:1 —— compilerOptions.${key} 关掉了，测试代码不许降标准`)
  }

  const include = config.include ?? []
  const exclude = config.exclude ?? []
  if (!include.length) {
    problems.push(`${configPath}:1 —— 没写 include，tsc 会把整个包都吃进来`)
    continue
  }

  const uncovered = testFiles.filter(f => !matchesAny(include, f) || matchesAny(exclude, f))
  if (uncovered.length) {
    problems.push(
      `${configPath}:1 —— include ${JSON.stringify(include)} 没盖住 tests/ 下 ${uncovered.length} 份 .ts，`
      + `例如 ${uncovered[0]}`,
    )
  }
  checkedFiles += testFiles.length - uncovered.length

  const pkgPath = posix.join(dir, 'package.json')
  const pkg = await readJson(pkgPath)
  const script = pkg.scripts?.typecheck
  if (!script)
    problems.push(`${pkgPath}:1 —— 没有 typecheck 脚本，${TEST_CONFIG} 不会被跑到`)
  else if (!script.includes(`-p ${TEST_CONFIG}`))
    problems.push(`${pkgPath}:1 —— typecheck 脚本 ${JSON.stringify(script)} 没跑 ${TEST_CONFIG}，配了也是摆设`)
}

for (const [dir, why] of exempt) {
  if (!seenExempt.has(dir))
    problems.push(`${REGISTRY}:1 —— 登记了豁免 ${dir}（${why}）却没扫到这个带 tests/ 的包，名单过期了`)
}

if (problems.length) {
  console.error('[check-typecheck-scope] ✗ 测试代码没被纳入类型检查：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-typecheck-scope] 通过：${checkedPackages} 个带 tests/ 的包各有 ${TEST_CONFIG}，`
  + `共 ${checkedFiles} 份测试文件在类型检查内（豁免 ${exempt.size} 处）`,
)
