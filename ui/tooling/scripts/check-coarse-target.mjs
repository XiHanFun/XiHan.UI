#!/usr/bin/env node
// 门禁：可聚焦部件的命中区不许低于下限，粗指针下的放大只许走伪元素。
//
// 两档各查各的：
//   A 档 · 细指针 24×24（WCAG 2.2 SC 2.5.8 AA）——凡可聚焦部件（含输入盒里的内嵌控制），
//     皮肤里写死的视觉盒边长低于 24px、伪元素又没把命中区补回 24px 的，判红。
//   B 档 · 粗指针 44×44（WCAG 2.2 SC 2.5.5 AAA）——只查登记在册的独立触控目标：
//     `@media (pointer: coarse)` 里要把命中区放大到 44px。
//
// 这是静态扫描，量不到浏览器算出来的盒，所以只认皮肤里写死的尺寸声明：
// inline-size / block-size / width / height 的字面值，以及能顺着令牌链走到字面值的 var()。
// 值是 100% / auto / max-content / calc() / em 的部件量不出边长，不进判定面。
// 一个部件取它所有尺寸声明里最小的那个数当视觉盒边长——24×24 与 44×44 是两条边都要过的门槛。
//
// 可聚焦的判据取连接层：props 走 normalize.button / .input / .textarea / .select，
// 或者自己写了 tabindex 的那些 getter，它们挂的部件就是可聚焦部件。
//
// 登记表 coarse-target-registry.json 分四张：
//   exempt      量得出边长但不是指针落点的部件（藏起来的原生 input）
//   inlineMark  随文排的标记档：视觉盒 16px，尺寸基准与圆角两项旁证由本脚本复核
//   backlog     A 档存量：低于 24px 且还没做外扩的部件，逐条带理由，门禁放行
//   coarseTargets  B 档名单：独立触控目标，没做粗指针放大的带 pending 理由，门禁放行
// 四张表两侧都反查：登记了却不再命中（部件退役、尺寸改了、外扩补上了）一律判红。
// `--update` 只刷新表里的 px 与新增的 A 档命中，理由留空由人补，不删条目。
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { declarations, lineCounter, stripComments } from './lib/css-declarations.mjs'

const SKINS = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'
const TOKENS = 'packages/design/tokens/src/generated/tokens.ts'
const REGISTRY = 'tooling/scripts/coarse-target-registry.json'

/** 细指针下的命中区下限。 */
const FINE_MIN = 24
/** 粗指针下独立触控目标的命中区下限。 */
const COARSE_MIN = 44

/** 写死视觉盒边长的属性。min-* / max-* 只是上下界，量不出实际边长，不收。 */
const BOX_PROPS = new Set(['inline-size', 'block-size', 'width', 'height'])

/** 会改布局占位的属性：粗指针块里出现即判红，放大只许走伪元素。 */
const LAYOUT_PROPS = /^(?:inline-size|block-size|width|height|min-|max-|padding|margin|gap|row-gap|column-gap|border-width|border-block|border-inline)/

/** 四边外扩的 inset 属性，负值即把伪元素撑到视觉盒之外。 */
const INSET_PROPS = new Set([
  'inset',
  'inset-block',
  'inset-inline',
  'inset-block-start',
  'inset-block-end',
  'inset-inline-start',
  'inset-inline-end',
  'top',
  'right',
  'bottom',
  'left',
])

/** 粗指针媒体块的写法。`any-pointer` 另有一条规则单查，不算在内。 */
const COARSE_MEDIA = /@media[^{]*[(\s]pointer\s*:\s*coarse/

/** 随文标记档的两项旁证：尺寸基准与圆角。 */
const INLINE_MARK_SIZE = '--xh-control-indicator-size'
const INLINE_MARK_RADIUS = '--xh-shape-inset'

const problems = []

/** 全局令牌表：名字 → 声明值。 */
const globalTokens = new Map()
for (const m of (await readFile(TOKENS, 'utf8')).matchAll(/"(--xh-[\w-]+)":\s*"([^"]*)"/g))
  globalTokens.set(m[1], m[2])

/** 连接层里可聚焦的部件：组件名 → 部件名集合。 */
async function collectFocusableParts() {
  const found = new Map()
  const dirs = (await readdir(HEADLESS, { withFileTypes: true })).filter(d => d.isDirectory()).map(d => d.name).sort()
  for (const comp of dirs) {
    let src
    try {
      src = await readFile(join(HEADLESS, comp, `${comp}.connect.ts`), 'utf8')
    }
    catch {
      continue
    }
    src = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/.*$/gm, '$1')
    const marks = [...src.matchAll(/get([A-Z][A-Za-z0-9]*)Props\s*[:=]/g)]
    for (let i = 0; i < marks.length; i++) {
      const body = src.slice(marks[i].index, i + 1 < marks.length ? marks[i + 1].index : src.length)
      const kind = body.match(/normalize\.([a-z]+)\s*\(/)?.[1]
      const focusable = kind === 'button' || kind === 'input' || kind === 'textarea' || kind === 'select' || /'tabindex'\s*:/.test(body)
      if (!focusable)
        continue
      for (const ref of body.matchAll(/parts(?:\.([\w-]+)|\[\s*'([^']+)'\s*\])\.attrs/g)) {
        if (!found.has(comp))
          found.set(comp, new Set())
        found.get(comp).add(ref[1] ?? ref[2])
      }
    }
  }
  return found
}

/** 在括号与方括号之外按分隔符切段：`var(--a, var(--b))` 里的逗号、`calc(a b)` 里的空格都不算分隔符。 */
function splitTopLevel(text, isSep = ch => ch === ',') {
  const out = []
  let depth = 0
  let start = 0
  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (ch === '(' || ch === '[') {
      depth++
    }
    else if (ch === ')' || ch === ']') {
      depth--
    }
    else if (depth === 0 && isSep(ch)) {
      out.push(text.slice(start, i))
      start = i + 1
    }
  }
  out.push(text.slice(start))
  return out.map(s => s.trim()).filter(Boolean)
}

/** 顺着令牌链把取值算成 px；算不出就返回 null。 */
function toPx(value, locals, depth = 0) {
  const v = value.trim()
  if (depth > 8)
    return null
  let m = /^(-?[\d.]+)px$/.exec(v)
  if (m)
    return Number(m[1])
  m = /^(-?[\d.]+)rem$/.exec(v)
  if (m)
    return Number(m[1]) * 16
  m = /^calc\(\s*-1\s*\*\s*(\S[\s\S]*)\)$/.exec(v)
  if (m) {
    const inner = toPx(m[1], locals, depth + 1)
    return inner == null ? null : -inner
  }
  m = /^var\(\s*(--[\w-]+)\s*(?:,([\s\S]*))?\)$/.exec(v)
  if (m) {
    for (const declared of locals.get(m[1]) ?? (globalTokens.has(m[1]) ? [globalTokens.get(m[1])] : [])) {
      const resolved = toPx(declared, locals, depth + 1)
      if (resolved != null)
        return resolved
    }
    return m[2] == null ? null : toPx(m[2], locals, depth + 1)
  }
  return null
}

/** 一条选择器分支的落点部件：最右边那个 data-part 就是规则的主语。 */
function subjectPart(branch) {
  const hits = [...branch.matchAll(/\[data-part='([a-z0-9-]+)'\]/g)]
  return hits.length ? hits[hits.length - 1][1] : null
}

/**
 * 扫一份皮肤，收出每个可聚焦部件的视觉盒边长、伪元素外扩量，以及粗指针块里的声明。
 * 返回 { box, expand, coarseExpand, mark, coarseDecls }，键都是部件名。
 */
function scanSkin(css, parts) {
  const lineAt = lineCounter(css)
  const locals = new Map()
  for (const decl of declarations(css)) {
    if (decl.prop.startsWith('--'))
      locals.set(decl.prop, [...(locals.get(decl.prop) ?? []), decl.value])
  }

  const box = new Map()
  const expand = new Map()
  const coarseExpand = new Map()
  const mark = new Map()
  const coarseDecls = []

  for (const decl of declarations(css)) {
    const inCoarse = decl.selectors.some(sel => COARSE_MEDIA.test(sel))
    const selector = decl.selectors[decl.selectors.length - 1] ?? ''
    const line = lineAt(decl.index)

    for (const branch of splitTopLevel(selector)) {
      const part = subjectPart(branch)
      if (part == null || !parts.has(part))
        continue
      const pseudo = /::(?:before|after)/.test(branch)

      if (inCoarse) {
        coarseDecls.push({ part, prop: decl.prop, value: decl.value, line, pseudo })
      }

      if (pseudo) {
        if (!INSET_PROPS.has(decl.prop))
          continue
        // 四边可以写成一条 inset，也可以逐边写；取最小的那个负值做外扩量
        const values = splitTopLevel(decl.value, ch => ch === ' ' || ch === '\t' || ch === '\n')
        let least = null
        for (const one of values) {
          const px = toPx(one, locals)
          if (px == null || px >= 0)
            continue
          least = least == null ? -px : Math.min(least, -px)
        }
        if (least == null)
          continue
        const target = inCoarse ? coarseExpand : expand
        const cur = target.get(part)
        if (cur == null || least < cur)
          target.set(part, least)
        continue
      }

      if (BOX_PROPS.has(decl.prop) && !inCoarse) {
        const px = toPx(decl.value, locals)
        if (px == null || px <= 0)
          continue
        const cur = box.get(part)
        if (cur == null || px < cur.px)
          box.set(part, { px, prop: decl.prop, value: decl.value.trim(), line })
      }

      // 随文标记档的两项旁证：尺寸基准取指示符档、圆角取内嵌档
      if (BOX_PROPS.has(decl.prop) && decl.value.includes(INLINE_MARK_SIZE))
        mark.set(part, { ...(mark.get(part) ?? {}), size: true })
      if (decl.prop === 'border-radius' && decl.value.includes(INLINE_MARK_RADIUS))
        mark.set(part, { ...(mark.get(part) ?? {}), radius: true })
    }
  }

  return { box, expand, coarseExpand, mark, coarseDecls }
}

const focusableParts = await collectFocusableParts()
const files = (await readdir(SKINS)).filter(f => f.endsWith('.css')).sort()

/** 全库量得出边长的可聚焦部件：`组件:部件` → 量出来的数与出处。 */
const measured = new Map()
/** 粗指针媒体块里的全部声明，逐条留着查布局占位。 */
const coarseAll = []
/** 媒体查询里出现的指针条件写法。 */
const pointerMedia = []

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const parts = focusableParts.get(comp)
  const raw = await readFile(join(SKINS, file), 'utf8')
  const css = stripComments(raw)
  const lineAt = lineCounter(css)

  for (const m of css.matchAll(/@media[^{]*/g)) {
    if (/any-pointer/.test(m[0]))
      pointerMedia.push({ file, line: lineAt(m.index), text: m[0].trim() })
  }

  if (!parts)
    continue
  const scan = scanSkin(css, parts)
  for (const [part, info] of scan.box) {
    const expand = scan.expand.get(part) ?? 0
    const coarse = scan.coarseExpand.get(part) ?? expand
    measured.set(`${comp}:${part}`, {
      px: info.px,
      prop: info.prop,
      value: info.value,
      at: `${file}:${info.line}`,
      fine: info.px + 2 * expand,
      coarse: info.px + 2 * coarse,
      mark: scan.mark.get(part) ?? {},
    })
  }
  for (const decl of scan.coarseDecls)
    coarseAll.push({ ...decl, file })
}

/** 读登记表；缺文件时按空表起步，`--update` 会把它写出来。 */
let registry = { exempt: {}, inlineMark: {}, backlog: {}, coarseTargets: {} }
try {
  registry = { ...registry, ...JSON.parse(await readFile(REGISTRY, 'utf8')) }
}
catch {
  if (!process.argv.includes('--update')) {
    console.error(`[check-coarse-target] ✗ 读不到 ${REGISTRY}——先跑 pnpm coarse-target:update 落表`)
    process.exit(1)
  }
}

const registered = new Set([
  ...Object.keys(registry.exempt),
  ...Object.keys(registry.inlineMark),
  ...Object.keys(registry.backlog),
])

if (process.argv.includes('--update')) {
  const next = {
    exempt: registry.exempt,
    inlineMark: registry.inlineMark,
    backlog: { ...registry.backlog },
    coarseTargets: { ...registry.coarseTargets },
  }
  for (const [key, info] of measured) {
    if (info.fine >= FINE_MIN || registered.has(key))
      continue
    next.backlog[key] = { px: info.px, why: registry.backlog[key]?.why ?? '' }
  }
  for (const key of Object.keys(next.backlog)) {
    if (measured.has(key))
      next.backlog[key] = { ...next.backlog[key], px: measured.get(key).px }
  }
  for (const key of Object.keys(next.coarseTargets)) {
    if (measured.has(key))
      next.coarseTargets[key] = { ...next.coarseTargets[key], px: measured.get(key).px }
  }
  const sortKeys = obj => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)))
  const out = {
    exempt: sortKeys(next.exempt),
    inlineMark: sortKeys(next.inlineMark),
    backlog: sortKeys(next.backlog),
    coarseTargets: sortKeys(next.coarseTargets),
  }
  await writeFile(REGISTRY, `${JSON.stringify(out, null, 2)}\n`, 'utf8')
  console.log(
    `[coarse-target:update] 已写入 ${REGISTRY}：`
    + `A 档存量 ${Object.keys(out.backlog).length} 条、B 档名单 ${Object.keys(out.coarseTargets).length} 条`
    + `——理由留空的条目要人补上，门禁会拦`,
  )
  process.exit(0)
}

// A 档：量得出边长的可聚焦部件，命中区不到 24px 的必须在三张表之一里
let finePass = 0
for (const [key, info] of measured) {
  if (info.fine >= FINE_MIN) {
    finePass++
    if (key in registry.backlog)
      problems.push(`${key}（${info.at}）命中区已到 ${info.fine}px——从 backlog 里挪走`)
    if (key in registry.exempt)
      problems.push(`${key}（${info.at}）命中区已到 ${info.fine}px——exempt 里那条过期了`)
    if (key in registry.inlineMark)
      problems.push(`${key}（${info.at}）命中区已到 ${info.fine}px——inlineMark 里那条过期了`)
    continue
  }
  if (key in registry.exempt || key in registry.inlineMark || key in registry.backlog)
    continue
  problems.push(
    `${key}（${info.at}）${info.prop}: ${info.value} = ${info.px}px，`
    + `伪元素也没外扩——细指针下命中区不足 ${FINE_MIN}×${FINE_MIN}；`
    + `补 ::before 负 inset 外扩，或登进 backlog 并写一句理由`,
  )
}

// 三张表反查：登记的键得还在，还得真的不达标；一个键只能落在其中一张表里
const placed = new Map()
for (const [table, entries] of [['exempt', registry.exempt], ['inlineMark', registry.inlineMark], ['backlog', registry.backlog]]) {
  for (const key of Object.keys(entries)) {
    if (placed.has(key))
      problems.push(`${key} 同时登在 ${placed.get(key)} 与 ${table} 里——一个部件只能定性一次`)
    else
      placed.set(key, table)
    if (!measured.has(key)) {
      problems.push(`${key} 登记在 ${table} 里，皮肤里却量不到它的视觉盒——部件退役或尺寸改成量不出的写法了，把这条一起改`)
      continue
    }
    if (table === 'backlog') {
      const entry = entries[key]
      if (!entry.why)
        problems.push(`${key} 登在 backlog 里没写理由——补一句「现在为什么还是这个尺寸」`)
      if (entry.px !== measured.get(key).px)
        problems.push(`${key} 在 backlog 里登记 ${entry.px}px，量出来 ${measured.get(key).px}px——尺寸改过了，跑 pnpm coarse-target:update 重登`)
    }
    if (table === 'exempt' && !entries[key])
      problems.push(`${key} 登在 exempt 里没写理由——补一句「为什么它不是指针落点」`)
  }
}

// 随文标记档的两项旁证
for (const key of Object.keys(registry.inlineMark)) {
  const info = measured.get(key)
  if (!info)
    continue
  if (!info.mark.size)
    problems.push(`${key} 取随文标记档，尺寸基准却不是 var(${INLINE_MARK_SIZE})`)
  if (!info.mark.radius)
    problems.push(`${key} 取随文标记档，圆角却不是 var(${INLINE_MARK_RADIUS})`)
}

// B 档：登记在册的独立触控目标，粗指针下命中区要到 44px
let coarsePass = 0
for (const [key, entry] of Object.entries(registry.coarseTargets)) {
  const info = measured.get(key)
  if (!info) {
    problems.push(`${key} 登记成独立触控目标，皮肤里却量不到它的视觉盒——部件退役或改名了，把这条一起改`)
    continue
  }
  if (entry.px !== info.px)
    problems.push(`${key} 在 coarseTargets 里登记 ${entry.px}px，量出来 ${info.px}px——尺寸改过了，跑 pnpm coarse-target:update 重登`)
  if (!entry.why)
    problems.push(`${key} 登在 coarseTargets 里没写理由——补一句「它为什么是手指直接落上去的目标」`)
  if (info.coarse >= COARSE_MIN) {
    coarsePass++
    if (entry.pending)
      problems.push(`${key} 粗指针下命中区已到 ${info.coarse}px——pending 那条理由过期了，删掉`)
    continue
  }
  if (!entry.pending) {
    problems.push(
      `${key}（${info.at}）视觉盒 ${info.px}px，粗指针下命中区 ${info.coarse}px——`
      + `在 @media (pointer: coarse) 里给它补 ::before 负 inset 外扩到 ${COARSE_MIN}px，`
      + `或写一句 pending 理由`,
    )
  }
}

// 粗指针块里不许改布局占位
for (const decl of coarseAll) {
  if (decl.pseudo)
    continue
  if (LAYOUT_PROPS.test(decl.prop)) {
    problems.push(
      `${decl.file}:${decl.line} [${decl.part}] ${decl.prop}: ${decl.value}`
      + ` —— 粗指针块里改了布局占位，命中区放大只许走绝对定位的伪元素`,
    )
  }
}

// 指针条件的写法
for (const hit of pointerMedia)
  problems.push(`${hit.file}:${hit.line} ${hit.text} —— 指针条件写 (pointer: coarse)，不写 any-pointer`)

if (problems.length) {
  console.error('[check-coarse-target] ✗ 命中区对不上下限：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const backlogCount = Object.keys(registry.backlog).length
const pending = Object.values(registry.coarseTargets).filter(e => e.pending).length
console.log(
  `[check-coarse-target] 通过：${files.length} 份皮肤 · ${measured.size} 个可聚焦部件量得出视觉盒，`
  + `其中 ${finePass} 个细指针命中区到 ${FINE_MIN}px；`
  + `A 档存量 ${backlogCount} 条、随文标记例外 ${Object.keys(registry.inlineMark).length} 条、`
  + `不作落点 ${Object.keys(registry.exempt).length} 条；`
  + `B 档独立触控目标 ${Object.keys(registry.coarseTargets).length} 个，`
  + `${coarsePass} 个粗指针下到 ${COARSE_MIN}px、${pending} 个待做`,
)
