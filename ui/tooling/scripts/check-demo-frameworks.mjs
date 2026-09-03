#!/usr/bin/env node
// 门禁：文档站示例的多框架文件不许各说各话。
//
// 同一个示例的各框架版本同名不同扩展名放在同一个目录里（01-basic.vue / 01-basic.html），
// 每份都在首行写「标题 | 说明」。首行是生成器落成 h3 与段落的唯一来源，也是读者切换框架时
// 唯一不变的那句话——两边一旦漂开，同一个示例就成了两份文档。
//
// 三条硬判据：首行逐字一致、每个示例都有规范来源框架的那份、目录里不出现未登记的扩展名。
//
// 第四条「每个示例都要备齐全部框架」不在硬判据里，只报覆盖率。
// 置 XH_DEMO_REQUIRE_ALL_FRAMEWORKS=1 把缺席逐条升成失败，缺几条就红几条。
//
// 有些目录的主语不是元素而是一个框架无关的 JS 包，那种目录不出这个框架的版本，
// 写在 scripts/demo-frameworks.json 的 notApplicable 里。登记带三条反查，谁也放不烂：
// 目录必须真的存在、必须没有这个框架的文件、必须没有对应的自定义元素——
// 哪天 <xh-那个目录名> 落地了，这条登记当场判红，结论要重新做。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const DEMOS_DIR = '../docs/.vitepress/demos'
const TABLE = 'scripts/demo-frameworks.json'
// 示例的规范来源：缺这份就是没有基准
const SPEC = 'vue'
// 缺席默认只报数：置 1 之后每个缺席的框架版本各报一条
const REQUIRE_ALL = process.env.XH_DEMO_REQUIRE_ALL_FRAMEWORKS === '1'

const { frameworks, notApplicable = {} } = JSON.parse(await readFile(TABLE, 'utf8'))
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

/** 自定义元素清单里的全部标签名。 */
async function elementTags(manifest) {
  const cem = JSON.parse(await readFile(manifest, 'utf8'))
  const tags = new Set()
  for (const module of cem.modules ?? []) {
    for (const declaration of module.declarations ?? []) {
      if (declaration.tagName)
        tags.add(declaration.tagName)
    }
  }
  return tags
}

const errors = []
const dirs = (await readdir(DEMOS_DIR, { withFileTypes: true }))
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)
  .sort()

// 「这个目录不出这个框架的版本」的登记表：框架 id → 目录名 → 结论
const exempt = new Map(frameworks.map(f => [f.id, new Map()]))

for (const [id, entries] of Object.entries(notApplicable)) {
  const fw = frameworks.find(f => f.id === id)
  if (!fw) {
    errors.push(`notApplicable 里的 ${id} 不是登记过的框架`)
    continue
  }
  // 登记必须能过期：没有元素清单就没有反查，那条登记等于一句无人复核的断言
  if (!fw.elements) {
    errors.push(`${fw.name} 有 notApplicable 登记，却没在 ${TABLE} 里写 elements 清单路径，登记就没有反查`)
    continue
  }
  const tags = await elementTags(fw.elements)
  for (const [dir, reason] of Object.entries(entries)) {
    if (!dirs.includes(dir)) {
      errors.push(`notApplicable 登记了 ${dir}，但 ${DEMOS_DIR} 下没有这个目录`)
      continue
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      errors.push(`notApplicable 的 ${dir} 没写结论，登记不许留白`)
      continue
    }
    if (tags.has(`xh-${dir}`)) {
      errors.push(`notApplicable 登记 ${dir} 不出 ${fw.name} 版，理由是没有对应的元素，但 <xh-${dir}> 已经在 ${fw.elements} 里了——这条结论过期了`)
      continue
    }
    exempt.get(id).set(dir, reason)
  }
}

let total = 0
const covered = new Map(frameworks.map(f => [f.id, 0]))
const skipped = new Map(frameworks.map(f => [f.id, 0]))
// 缺席的逐条记名：只报一个数的话，少掉哪几份没人看得出来
const absent = new Map(frameworks.map(f => [f.id, []]))

for (const dir of dirs) {
  // 各框架的同名文件归成一条，键是不带扩展名的基名
  const byBase = new Map()
  for (const file of (await readdir(join(DEMOS_DIR, dir))).sort()) {
    const fw = frameworks.find(f => file.endsWith(f.ext))
    if (!fw) {
      errors.push(`${dir}/${file} 的扩展名没登记在 ${TABLE} 里，谁都不会读它`)
      continue
    }
    if (exempt.get(fw.id).has(dir))
      errors.push(`${dir}/${file} 是 ${fw.name} 版，但 ${dir} 登记了不出 ${fw.name} 版——留一份就说明那条结论不成立了`)
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

    for (const fw of frameworks) {
      if (versions.has(fw.id))
        continue
      if (exempt.get(fw.id).has(dir)) {
        skipped.set(fw.id, skipped.get(fw.id) + 1)
        continue
      }
      absent.get(fw.id).push(`${dir}/${base}`)
      if (REQUIRE_ALL)
        errors.push(`${dir}/${base} 缺 ${fw.name} 版`)
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
const aside = frameworks
  .filter(f => skipped.get(f.id) > 0)
  .map(f => `${f.name} 另有 ${skipped.get(f.id)} 份登记为不适用（${[...exempt.get(f.id).keys()].join('、')}）`)
  .join('，')
const mode = REQUIRE_ALL ? '按齐备要求' : '缺席只报数（置 XH_DEMO_REQUIRE_ALL_FRAMEWORKS=1 升为失败）'
console.log(
  `[check-demo-frameworks] 通过：${dirs.length} 个组件 · ${total} 个示例，覆盖 ${rate}，${aside ? `${aside}，` : ''}${mode}`,
)
// 缺席逐条印出来：一个覆盖率数字读过就忘，名字摆出来才知道欠的是哪几份
for (const fw of frameworks) {
  const list = absent.get(fw.id)
  if (list.length > 0)
    console.log(`  还欠 ${fw.name} 版 ${list.length} 份：${list.join('、')}`)
}
