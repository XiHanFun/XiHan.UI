#!/usr/bin/env node
// 门禁：有 TypeScript 测试的包必须把测试代码也纳入类型检查。
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
import { join, posix } from 'node:path'
import process from 'node:process'
import { exists, listFiles, listPackages, matchesAny, readJson } from './lib/tsconfig.mjs'

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
  const testFiles = (await listFiles(testsDir, 'tests')).filter(f => f.endsWith('.ts'))
  // 空目录或只放非 TypeScript 夹具时没有类型检查对象，不要求空壳 tsconfig。
  if (testFiles.length === 0)
    continue

  if (exempt.has(dir)) {
    seenExempt.add(dir)
    if (await exists(configPath))
      problems.push(`${configPath}:1 —— 已经有 ${TEST_CONFIG} 了，豁免登记过期，从 ${REGISTRY} 里删掉`)
    continue
  }

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
