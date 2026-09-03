#!/usr/bin/env node
// 门禁：commitlint 的 scope-enum 不许指向仓库里不存在的东西。
//
// 两条判据：
// ① 「库包」那一组与 packages/*/* 下的包名双向逐个对上——多一个就是留着一个已经没有的包名，
//    少一个就是新包进来了却没人能用它当 scope。
// ② 任何一个分组头下面都必须至少有一个成员——空组是成员被删干净后剩下的壳。
//
// 其余分组（工程 / 跨切）混着目录名与概念名（ci / deps / repo），不做名字到路径的映射。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const CONFIG = 'commitlint.config.js'
const PKG_DIR = 'packages'
const PKG_GROUP = '库包'
const SCOPE_PREFIX = '@xihan-ui/'

/** packages/<角色组>/<包>：两级。 */
async function packageNames() {
  const out = []
  for (const group of await readdir(PKG_DIR, { withFileTypes: true })) {
    if (!group.isDirectory())
      continue
    for (const leaf of await readdir(join(PKG_DIR, group.name), { withFileTypes: true })) {
      if (!leaf.isDirectory())
        continue
      const manifest = join(PKG_DIR, group.name, leaf.name, 'package.json')
      const pkg = await readFile(manifest, 'utf8').then(JSON.parse).catch(() => null)
      if (pkg?.name?.startsWith(SCOPE_PREFIX))
        out.push(pkg.name.slice(SCOPE_PREFIX.length))
    }
  }
  return out
}

/**
 * 按 `// —— 组名 ——` 注释把 scope-enum 切成分组；返回 [组名, 成员数组] 的有序表。
 * 只认 scope-enum 那一段：从 'scope-enum' 起到该数组闭合为止。
 */
function parseGroups(source) {
  const start = source.indexOf('\'scope-enum\'')
  if (start < 0)
    return null
  const body = source.slice(start)
  const groups = []
  let current = null
  for (const raw of body.split('\n')) {
    const line = raw.trim()
    const header = /^\/\/\s*——([^—]+)——\s*$/.exec(line)
    if (header) {
      current = { name: header[1].trim(), members: [] }
      groups.push(current)
      continue
    }
    const member = /^'([^']+)',?$/.exec(line)
    if (member && current)
      current.members.push(member[1])
    // 数组闭合：分组段到此为止
    if (line === '],' && groups.length > 0)
      break
  }
  return groups
}

const source = await readFile(CONFIG, 'utf8')
const groups = parseGroups(source)
if (groups == null || groups.length === 0) {
  console.error(`[check-commit-scopes] ✗ ${CONFIG} 里没解析出 scope-enum 的分组，格式变了`)
  process.exit(1)
}

const problems = []

for (const group of groups) {
  if (group.members.length === 0)
    problems.push(`分组「${group.name}」下面一个成员都没有——成员删光了就把分组头一起删掉`)
}

// 分组头后面常跟一句括号说明，按前缀认
const pkgGroup = groups.find(g => g.name.startsWith(PKG_GROUP))
if (!pkgGroup) {
  problems.push(`没找到「${PKG_GROUP}」分组——它是与 packages/ 对账的那一组`)
}
else {
  const actual = new Set(await packageNames())
  const listed = new Set(pkgGroup.members)
  for (const name of listed) {
    if (!actual.has(name))
      problems.push(`「${pkgGroup.name}」里的 ${name} 在 packages/ 下没有对应的包`)
  }
  for (const name of actual) {
    if (!listed.has(name))
      problems.push(`packages/ 下的 ${SCOPE_PREFIX}${name} 没登记进「${pkgGroup.name}」，写提交时用不了这个 scope`)
  }
}

if (problems.length > 0) {
  console.error('[check-commit-scopes] ✗')
  for (const p of problems) console.error(`  ${p}`)
  process.exit(1)
}

const total = groups.reduce((n, g) => n + g.members.length, 0)
console.log(`[check-commit-scopes] 通过：${groups.length} 个分组共 ${total} 个 scope，「${pkgGroup.name}」与 packages/ 下 ${pkgGroup.members.length} 个包双向对得上`)
