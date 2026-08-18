#!/usr/bin/env node
// 门禁：文档站示例的多框架文件不许各说各话。
//
// 同一个示例的各框架版本同名不同扩展名放在同一个目录里（01-basic.vue / 01-basic.html），
// 每份都在首行写「标题 | 说明」。首行是生成器落成 h3 与段落的唯一来源，也是读者切换框架时
// 唯一不变的那句话——两边一旦漂开，同一个示例就成了两份文档。
//
// 三条硬判据：首行逐字一致、每个示例都有规范来源框架的那份、目录里不出现未登记的扩展名。
// 「每个示例都要备齐全部框架」暂时只报覆盖率，打开 REQUIRE_ALL 才升成失败。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEMOS_DIR = '../docs/.vitepress/demos'
const TABLE = 'scripts/demo-frameworks.json'
// 示例的规范来源：缺这份就是没有基准
const SPEC = 'vue'
// 各框架示例补齐之前，缺席只报数不算失败
const REQUIRE_ALL = process.env.XH_DEMO_REQUIRE_ALL_FRAMEWORKS === '1'

const { frameworks } = JSON.parse(await readFile(TABLE, 'utf8'))
const spec = frameworks.find(f => f.id === SPEC)
if (!spec) {
  console.error(`[check-demo-frameworks] ✗ ${TABLE} 里没有 id 为 ${SPEC} 的框架`)
  process.exit(1)
}

/** 取首行注释里的「标题 | 说明」，没写返回 null。 */
function head(text) {
  const matched = text.match(/^<!--([\s\S]*?)-->/) ?? text.match(/^\/\/(.*)/)
  return matched ? matched[1].trim() : null
}

const errors = []
const dirs = (await readdir(DEMOS_DIR, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

let total = 0
const covered = new Map(frameworks.map(f => [f.id, 0]))

for (const dir of dirs) {
  // 各框架的同名文件归成一条，键是不带扩展名的基名
  const byBase = new Map()
  for (const file of (await readdir(join(DEMOS_DIR, dir))).sort()) {
    const fw = frameworks.find(f => file.endsWith(f.ext))
    if (!fw) {
      errors.push(`${dir}/${file} 的扩展名没登记在 ${TABLE} 里，谁都不会读它`)
      continue
    }
    const base = file.slice(0, -fw.ext.length)
    if (!byBase.has(base))
      byBase.set(base, new Map())
    byBase.get(base).set(fw.id, file)
  }

  for (const base of [...byBase.keys()].sort()) {
    const versions = byBase.get(base)
    total++

    const heads = new Map()
    for (const [id, file] of versions) {
      covered.set(id, covered.get(id) + 1)
      const line = head(await readFile(join(DEMOS_DIR, dir, file), 'utf8'))
      if (line === null)
        errors.push(`${dir}/${file} 首行没写「标题 | 说明」注释`)
      else
        heads.set(id, line)
    }
    if (new Set(heads.values()).size > 1) {
      const shown = [...heads].map(([id, line]) => `${id}「${line}」`).join('，')
      errors.push(`${dir}/${base} 各框架的首行不一致：${shown}`)
    }

    if (!versions.has(spec.id))
      errors.push(`${dir}/${base} 缺 ${spec.name} 版，${spec.name} 是示例的规范来源`)

    if (REQUIRE_ALL) {
      for (const fw of frameworks) {
        if (!versions.has(fw.id))
          errors.push(`${dir}/${base} 缺 ${fw.name} 版`)
      }
    }
  }
}

if (errors.length > 0) {
  console.error('[check-demo-frameworks] ✗')
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
}

const rate = frameworks
  .map(f => `${f.name} ${covered.get(f.id)}/${total}`)
  .join(' · ')
const mode = REQUIRE_ALL ? '按齐备要求' : '缺席只报数（置 XH_DEMO_REQUIRE_ALL_FRAMEWORKS=1 升为失败）'
console.log(`[check-demo-frameworks] 通过：${dirs.length} 个组件 · ${total} 个示例，覆盖 ${rate}，${mode}`)
