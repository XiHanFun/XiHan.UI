#!/usr/bin/env node
// 门禁：包所在的角色组必须与它「怎么到达使用者」一致。
//
// packages/ 的四个组名说的是包与使用者的关系，不是代码的层级：
//   engine   = 每个适配器的硬依赖，使用者装了适配器就自动拿到，做不了取舍
//   features = 没有任何适配器硬依赖它，使用者不点头它就不来
//   design   = 纯视觉资产，谁都不硬依赖
//   adapters = 渲染目标
//
// 没有这条门禁，组名就只是文件夹名字：新包随手一放，engine 迟早变成「底层的东西」的
// 垃圾桶，features 变成「不知道放哪」的垃圾桶，而两个组名都还挂在那儿骗人。
//
// 判据只看 package.json 的依赖声明，不看 import——一个包是不是强制来的，
// 由声明决定，不由谁 import 了它决定。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const PACKAGES = 'packages'
const ADAPTERS = 'adapters'

/** 读一个包的清单。 */
async function manifest(group, name) {
  return JSON.parse(await readFile(join(PACKAGES, group, name, 'package.json'), 'utf8'))
}

const groups = (await readdir(PACKAGES, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

if (!groups.includes(ADAPTERS)) {
  console.error(`[check-package-roles] ✗ 找不到 ${PACKAGES}/${ADAPTERS}——组改名了就把这里一起改`)
  process.exit(1)
}

/** group -> [{ name, pkg }] */
const members = new Map()
for (const group of groups) {
  const names = (await readdir(join(PACKAGES, group), { withFileTypes: true }))
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
  members.set(group, await Promise.all(names.map(async name => ({ name, pkg: await manifest(group, name) }))))
}

const adapters = members.get(ADAPTERS) ?? []
if (adapters.length === 0) {
  console.error('[check-package-roles] ✗ adapters/ 是空的，判据无从谈起')
  process.exit(1)
}

/** 每个适配器都把它写进 dependencies —— 「使用者做不了取舍」的机读定义。 */
function hardDependencyOfEveryAdapter(packageName) {
  return adapters.every(({ pkg }) => pkg.dependencies?.[packageName] !== undefined)
}

/** 任何一个适配器把它写进 dependencies。 */
function hardDependencyOfAnyAdapter(packageName) {
  return adapters.some(({ pkg }) => pkg.dependencies?.[packageName] !== undefined)
}

const offenders = []

for (const [group, list] of members) {
  if (group === ADAPTERS)
    continue
  for (const { name, pkg } of list) {
    const path = `${group}/${name}`
    const forced = hardDependencyOfEveryAdapter(pkg.name)
    const partial = hardDependencyOfAnyAdapter(pkg.name)

    // 只被一部分适配器硬依赖：两个组都不该收，先说清它到底是什么
    if (partial && !forced) {
      offenders.push(`${path}（${pkg.name}）只被一部分适配器硬依赖——要么补齐，要么改成可选 peer`)
      continue
    }

    if (group === 'engine' && !forced)
      offenders.push(`${path}（${pkg.name}）在 engine 里，但不是每个适配器的硬依赖——使用者能选择要不要它，该去 features`)

    if (group === 'features' && forced)
      offenders.push(`${path}（${pkg.name}）在 features 里，但每个适配器都硬依赖它——使用者躲不掉，该去 engine`)

    if (group === 'design' && partial)
      offenders.push(`${path}（${pkg.name}）在 design 里，却被适配器硬依赖——视觉资产该由使用者显式安装`)
  }
}

if (offenders.length) {
  console.error('[check-package-roles] 角色组与到达使用者的方式对不上：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error('  判据见 packages/README.md：engine = 强制来的，features = 你选的。')
  process.exit(1)
}

const counts = [...members].map(([group, list]) => `${group} ${list.length}`).join(' · ')
console.log(`[check-package-roles] 通过：${counts}，每个包的角色组都与它到达使用者的方式一致`)
