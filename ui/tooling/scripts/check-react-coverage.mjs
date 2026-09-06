#!/usr/bin/env node
// 门禁：React 的铺开进度登记与公开面对得上。
//
// react-coverage.json 是「React 侧铺到哪儿了」的唯一真源，另外十几张门禁按它决定
// 该核哪些组件。它一旦与实际公开面分叉，那十几张门禁就跟着核错人：登记多了会去核
// 一个不存在的组件（判红，还算显眼），登记少了则是**静默漏检**——组件明明铺好了，
// 却一张门禁都不核它。
//
// 判据取「主入口导出了根组件」，与一致性套件解析 fixture 用的是同一条：
// `Xh{Pascal}` 或 `Xh{Pascal}Root`。按目录判会把只放了接线口子、还没有组件的目录
// （field 就是这样）误算成已铺。
import { readdir, readFile } from 'node:fs/promises'
import process from 'node:process'
import { readReactCoverage } from './lib/adapters.mjs'

const SUITES_DIR = 'tooling/testing/src/suites'
const REACT_INDEX = 'packages/adapters/react/src/index.ts'

function pascal(s) {
  return s.split(/[-_]/).filter(Boolean).map(w => w[0].toUpperCase() + w.slice(1)).join('')
}

const coverage = await readReactCoverage()
const covered = new Set(coverage.covered)

const suites = (await readdir(SUITES_DIR))
  .filter(f => f.endsWith('.suite.ts'))
  .map(f => f.replace('.suite.ts', ''))
  .sort()

const indexSrc = await readFile(REACT_INDEX, 'utf8')
/** 主入口导出的名字。 */
const exported = new Set([...indexSrc.matchAll(/\b(Xh[A-Z]\w*)/g)].map(m => m[1]))

/** 主入口有没有这个组件的根。 */
function hasRoot(component) {
  const p = pascal(component)
  return exported.has(`Xh${p}`) || exported.has(`Xh${p}Root`)
}

const problems = []

for (const name of covered) {
  if (!suites.includes(name))
    problems.push(`${name} 登记成已铺，但 ${SUITES_DIR}/${name}.suite.ts 不存在——名字拼错的话按它去核的门禁会一个都核不到`)
  else if (!hasRoot(name))
    problems.push(`${name} 登记成已铺，但 ${REACT_INDEX} 没导出 Xh${pascal(name)}[Root]`)
}

for (const name of suites) {
  if (!covered.has(name) && hasRoot(name))
    problems.push(`Xh${pascal(name)}[Root] 已经导出了，却没登记进 react-coverage.json——按登记决定核谁的那些门禁会跳过它`)
}

if (problems.length) {
  console.error('[check-react-coverage] ✗ React 铺开登记与公开面对不上：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

console.log(
  `[check-react-coverage] 通过：React 已铺 ${covered.size}/${suites.length} 个组件，`
  + `登记与主入口两侧对得上（待铺 ${suites.length - covered.size}）`,
)
