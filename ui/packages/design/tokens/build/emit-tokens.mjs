#!/usr/bin/env node
// 读 DTCG 令牌源 → 解析引用 → 产出 tokens.css / tokens.json / src/generated.ts。
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { applyFileHeader } from '../../../../tooling/file-header.mjs'
import { INK_SURFACE_CONTENT, INK_TOKENS, inkBlocks } from './ink.mjs'
import { attachMaterialRecipes, emitMaterialRecipes } from './material-recipes.mjs'

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const TOKENS_DIR = join(ROOT, 'tokens')
/** 字形令牌取的图标源：图标包里逐枚手绘的 SVG，令牌只记名字，构建期内联成 data URI。 */
const ICON_SVG_DIR = join(ROOT, '..', 'icons', 'src', 'svg')

/** 库层序声明，与 packages/design/styles/css/layers.css 逐字一致，由 check-layer-order 门禁盯住。 */
const LAYER_ORDER = '@layer xihan.reset, xihan.tokens, xihan.motion, xihan.components, xihan.overrides;'

async function load(name, material) {
  const document = JSON.parse(await readFile(join(TOKENS_DIR, name), 'utf8'))
  return material ? attachMaterialRecipes(document, material, name) : document
}

/**
 * 图表分类色板由 emit-chart-palette.mjs 从基础色板算出，写在 chart.palette.json 的 light / dark 两组里；
 * 这里把它并进对应主题令牌源的 chart 组，与手写的 chart 令牌同名就抛。
 */
function attachChartPalette(document, fragment, name) {
  const chart = document.chart ?? (document.chart = {})
  for (const [key, value] of Object.entries(fragment.chart)) {
    if (key in chart)
      throw new Error(`[emit-tokens] chart.palette.json 的 chart.${key} 与 ${name} 手写的令牌重名`)
    chart[key] = value
  }
  return document
}

// 把 DTCG 组树展开成 [{ name: '--xh-a-b-c', value, type }]
function flatten(obj, path = []) {
  const out = []
  if (obj && typeof obj === 'object' && '$value' in obj) {
    // 段内的小数点（如刻度 0.5）在 CSS 自定义属性名里非法，替换为下划线
    out.push({ name: `--xh-${path.join('-').replace(/\./g, '_')}`, value: obj.$value, type: obj.$type })
    return out
  }
  for (const [key, child] of Object.entries(obj ?? {})) {
    if (child && typeof child === 'object')
      out.push(...flatten(child, [...path, key]))
  }
  return out
}

/**
 * 全部令牌源展开后的名字集合，由 main() 在产出前填好。
 * 引用只要在任一档里声明过就算数——CSS 自定义属性是继承 + 级联的，
 * 浅色块引深色块声明的名字在运行时仍解析得到。
 */
const declared = new Set()

// {color.brand.500} → var(--xh-color-brand-500)
function toVar(refPath) {
  const name = `--xh-${refPath.trim().replace(/\./g, '-')}`
  // 指向不存在的名字时，浏览器在计算值阶段就把整条声明判为无效，
  // 连 var() 的兜底也救不回来（槽位是「已声明但无效」）。这种引用只能在构建期拦。
  if (declared.size > 0 && !declared.has(name))
    throw new Error(`[emit-tokens] 令牌引用 {${refPath.trim()}} 指向不存在的 ${name}`)
  return `var(${name})`
}
/**
 * $type 为 icon 的令牌：值是图标包里的文件名，产出 `url("data:image/svg+xml,…")`，
 * 皮肤拿它当 mask-image 用，着色走 currentColor。SVG 压成一行再按 URL 规则转义。
 */
async function iconUrl(name) {
  let svg
  try {
    svg = await readFile(join(ICON_SVG_DIR, `${name}.svg`), 'utf8')
  }
  catch {
    throw new Error(`[emit-tokens] 字形令牌引用的图标 ${name}.svg 在 ${ICON_SVG_DIR} 里不存在`)
  }
  const compact = svg
    .replace(/<\?xml[^>]*>/, '')
    .replace(/\s+/g, ' ')
    .replace(/>\s+</g, '><')
    .trim()
    .replace(/"/g, '\'')
  const encoded = compact.replace(/[<>#%{}]/g, ch => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`)
  return `url("data:image/svg+xml,${encoded}")`
}

async function resolve(value, type) {
  if (type === 'icon')
    return iconUrl(String(value))
  if (typeof value === 'number')
    return String(value)
  return String(value).replace(/\{([^}]+)\}/g, (_, p) => toVar(p))
}

async function declarations(entries, indent = '    ') {
  const lines = []
  for (const e of entries)
    lines.push(`${indent}${e.name}: ${await resolve(e.value, e.type)};`)
  return lines.join('\n')
}

async function main() {
  const materials = await emitMaterialRecipes()
  // 基础色板由 emit-palette.mjs 从种子派生，是原语的一部分：两份源合成一棵树再展开
  const primitiveSource = await load('primitive.json')
  const palette = await load('primitive.palette.json')
  for (const name of Object.keys(palette.color)) {
    if (name in primitiveSource.color)
      throw new Error(`[emit-tokens] 基础色板的 ${name} 与 primitive.json 的 color.${name} 重名`)
    primitiveSource.color[name] = palette.color[name]
  }
  const primitive = flatten(primitiveSource)
  const base = flatten(await load('semantic.base.json', materials.fragments['semantic.base.json']))
  const compact = flatten(await load('semantic.compact.json'))
  const chartPalette = await load('chart.palette.json')
  const lightAll = flatten(attachChartPalette(await load('semantic.light.json', materials.fragments['semantic.light.json']), chartPalette.light, 'semantic.light.json'))
  const darkAll = flatten(attachChartPalette(await load('semantic.dark.json', materials.fragments['semantic.dark.json']), chartPalette.dark, 'semantic.dark.json'))
  const lightMore = flatten(await load('semantic.light.more.json', materials.fragments['semantic.light.more.json']))
  const darkMore = flatten(await load('semantic.dark.more.json', materials.fragments['semantic.dark.more.json']))
  const transparencyReduce = flatten(await load('semantic.transparency.reduce.json', materials.fragments['semantic.transparency.reduce.json']))
  const forcedColors = flatten(await load('semantic.forced-colors.json', materials.fragments['semantic.forced-colors.json']))
  const reduce = flatten(await load('semantic.reduce.json'))
  const print = flatten(await load('semantic.print.json', materials.fragments['semantic.print.json']))

  for (const e of [...primitive, ...base, ...compact, ...lightAll, ...darkAll, ...lightMore, ...darkMore, ...transparencyReduce, ...forcedColors, ...reduce, ...print])
    declared.add(e.name)

  // 两条轴可以落在不同祖先上。主题保存自己的候选值，对比度标记独立继承，
  // 每个轴边界重新选择公开值；不依赖只能命中同一节点的复合属性选择器。
  const mores = [new Map(lightMore.map(e => [e.name, e])), new Map([...lightMore, ...darkMore].map(e => [e.name, e]))]
  const contrasted = [...new Set([...lightMore, ...darkMore].map(e => e.name))].sort()
  const normals = [new Map([...primitive, ...base, ...lightAll].map(e => [e.name, e])), new Map([...primitive, ...base, ...lightAll, ...darkAll].map(e => [e.name, e]))]
  const routes = new Map()
  /** 参与路由的令牌 → 高对比分支的取值；墨色域只换缺省分支，高对比分支原样沿用 */
  const moreRoutes = new Map()
  const palettes = [[], []]
  for (const name of contrasted) {
    const choices = []
    for (const [mode, maps] of [['default', normals], ['more', mores]]) {
      const entries = maps.map(map => map.get(name))
      if (entries.some(entry => !entry))
        throw new Error(`[emit-tokens] 对比度候选缺少基线：${name}`)
      const values = await Promise.all(entries.map(entry => resolve(entry.value, entry.type)))
      if (values[0] === values[1]) {
        // 两主题同源的别名直接在当前边界求值，保留公开语义覆盖的传递关系。
        choices.push(values[0])
      }
      else {
        const slot = `--xh-_contrast-${mode}-${name.slice(5)}`
        values.forEach((value, index) => palettes[index].push(`    ${slot}: ${value};`))
        choices.push(`var(${slot})`)
      }
    }
    if (choices[0] !== choices[1]) {
      routes.set(name, `var(--xh-_contrast-use-default, ${choices[0]}) var(--xh-_contrast-use-more, ${choices[1]})`)
      moreRoutes.set(name, choices[1])
    }
  }

  /** 某主题下一支令牌解析到底的字面量：沿同档引用一路追到原语。 */
  function literal(theme, name, seen = new Set()) {
    if (seen.has(name))
      throw new Error(`[emit-tokens] 令牌引用成环：${[...seen, name].join(' → ')}`)
    seen.add(name)
    const entry = normals[theme === 'light' ? 0 : 1].get(name)
    if (!entry)
      throw new Error(`[emit-tokens] ${theme} 档里找不到 ${name}`)
    const ref = /^\{([^}]+)\}$/.exec(String(entry.value).trim())
    return ref ? literal(theme, `--xh-${ref[1].trim().replace(/\./g, '-')}`, seen) : String(entry.value)
  }
  const darkByName = new Map(darkAll.map(entry => [entry.name, entry]))
  // Recipe 真源里跨主题完全相同、且不参与 contrast 路由的材质通道只写一份声明。
  // 它们的值是指向 fg / bg / border 语义的 var() 引用，而自定义属性里的 var() 在声明它的那个元素上
  // 就求值：写在 :root 上会冻结成根主题的取值，嵌套的主题边界只继承到这份冻结值。所以这一块同时
  // 挂在每个 [data-theme] 边界上，引用在边界自己的主题里解析（与 contrast 路由重写在边界上同理）。
  const sharedMaterial = lightAll.filter((entry) => {
    const darkEntry = darkByName.get(entry.name)
    return entry.name.startsWith('--xh-material-')
      && !routes.has(entry.name)
      && darkEntry?.type === entry.type
      && darkEntry.value === entry.value
  })
  const sharedMaterialNames = new Set(sharedMaterial.map(entry => entry.name))
  // M0 实体材质写在 base 真源里，同样是指向主题语义的引用，与上面一起挂到主题边界上
  const isMaterial = entry => entry.name.startsWith('--xh-material-')
  const boundaryMaterial = [...base.filter(isMaterial), ...sharedMaterial]
  const basePlain = base.filter(entry => !isMaterial(entry))
  const light = lightAll.filter(entry => !sharedMaterialNames.has(entry.name))
  const dark = darkAll.filter(entry => !sharedMaterialNames.has(entry.name))
  const selection = [...routes].map(([name, value]) => `    ${name}: ${value};`).join('\n')
  const THEMES = ['light', 'dark']
  /** 缺省面的墨色取值（由 inkBlocks 求出）：改写成墨色的描边与淡底，以及新增的墨色本身与不透明档。 */
  let inkDefaults = [new Map(), new Map()]
  let inkAdditions = [new Map(), new Map()]
  async function themed(entries, index) {
    const inked = entries
      .filter(entry => !routes.has(entry.name))
      .map(entry => (inkDefaults[index].has(entry.name) ? { ...entry, value: inkDefaults[index].get(entry.name) } : entry))
    const added = [...inkAdditions[index]].map(([name, value]) => `    ${name}: ${value};`).join('\n')
    return `${added}\n${await declarations(inked)}\n${palettes[index].join('\n')}\n${selection}`
  }

  // auto 域不是主题边界：主题块里凡是引用了墨色令牌的声明，要在 auto 域上重新求值。
  // 对比度路由整组重声明（缺省分支里有 var(--xh-border-default) 这类引用）；其余只取两档同值、
  // 且引用了墨色令牌的那几支——两档不同值的属于极性本身，auto 域沿用外层主题
  const referencesInk = value => [...value.matchAll(/var\((--xh-[\w-]+)/g)].some(m => INK_TOKENS.has(m[1]))
  const reevaluate = [...routes].map(([name, value]) => `${name}: ${value};`)
  for (const entry of lightAll) {
    if (routes.has(entry.name) || INK_TOKENS.has(entry.name) || sharedMaterialNames.has(entry.name))
      continue
    const value = await resolve(entry.value, entry.type)
    const darkEntry = darkByName.get(entry.name)
    if (!darkEntry || await resolve(darkEntry.value, darkEntry.type) !== value || !referencesInk(value))
      continue
    reevaluate.push(`${entry.name}: ${value};`)
  }
  const ink = inkBlocks({ color: literal, moreRoutes, reevaluate })

  // 缺省面同样用墨色：令牌源里的中性色原值只是对比度等价的目标，主题块里写墨色按比例透明。
  // 参与对比度路由的那几支换缺省分支的候选槽（高对比分支仍取实色），其余在 themed() 里直接换值
  inkDefaults = THEMES.map(theme => ink.defaults[theme])
  inkAdditions = THEMES.map(theme => ink.additions[theme])
  for (const [index, defaults] of inkDefaults.entries()) {
    for (const [name, value] of defaults) {
      if (!routes.has(name))
        continue
      const slot = `--xh-_contrast-default-${name.slice(5)}`
      const at = palettes[index].findIndex(line => line.trim().startsWith(`${slot}:`))
      if (at < 0)
        throw new Error(`[emit-tokens] ${name} 参与对比度路由，却没有缺省分支的候选槽 ${slot}`)
      palettes[index][at] = `    ${slot}: ${value};`
    }
  }

  // —— tokens.css ——
  const css = `/* AUTO-GENERATED by build/emit-tokens.mjs — do not edit. */
${LAYER_ORDER}

@layer xihan.tokens {
  /* primitive：任何作用域都不变，只写一次 */
  :where(:root) {
    --xh-_contrast-use-default: initial;
    --xh-_contrast-use-more: ;
${await declarations(primitive)}
  }

  /* 非模式语义（密度等轴的基线合并写法） */
  :where(:root), :where([data-density='comfortable']) {
${await declarations(basePlain)}
  }

  /* 材质里跨主题同源的通道：值是指向主题语义的 var() 引用，自定义属性在声明处求值，
     只写在 :root 上会冻结成根主题的取值；同时挂在每个主题边界与墨色域上，引用才在那里自己的取值里解析 */
  :where(:root), :where([data-theme]), :where([data-xh-ink]), ${INK_SURFACE_CONTENT} {
${await declarations(boundaryMaterial)}
  }

  /* density 轴 · compact 档：只覆盖收紧的盒尺寸。排在基线合并块之后，
     同为零特指度时靠书写顺序压过基线；嵌套换档靠元素自身声明压过继承 */
  :where([data-density='compact']) {
${await declarations(compact)}
  }

  /* mode 轴 · 浅色基线与显式取值完全同源；合并选择器避免把整套候选重复输出两次。 */
  :where(:root), :where([data-theme='light']), :where([data-xh-ink='dark']) {
    color-scheme: light;
${await themed(light, 0)}
  }

  /* mode 轴 · 深色取值块（color-scheme 必须在此，嵌套深色区才能拿到深色原生控件） */
  :where([data-theme='dark']), :where([data-xh-ink='light']) {
    color-scheme: dark;
${await themed(dark, 1)}
  }

  /* 空白标记让该分支不产生值，initial 标记选用 var 的指定候选。
     两个正式分支彼此互斥；子主题继承标记，子对比度继承最近主题候选。 */
  :where([data-contrast='default']) {
    --xh-_contrast-use-default: initial;
    --xh-_contrast-use-more: ;
${selection}
  }

  :where([data-contrast='more']) {
    --xh-_contrast-use-default: ;
    --xh-_contrast-use-more: initial;
${selection}
  }

  /* 墨色域：彩色面声明自身底色的极性，域内的中性装饰取墨色按比例透明，在任何底色上显著度一致。
     dark / light 两种域同时是浅色 / 深色主题边界（见上面两个取值块的选择器），语气色与表面随极性走；
     这里只改墨色与中性装饰。比例由构建按「与缺省面上的原色对比度相等」求出，参与对比度路由的令牌
     只换缺省分支。排在主题块之后，同一元素上靠书写顺序压过主题块 */
${ink.css}

  /* 减少透明：直接打到主题边界、墨色域与组件作用域，避免祖先上已经解析的材质别名盖过实体替代。 */
  @media (prefers-reduced-transparency: reduce) {
    :where(:root), :where([data-theme]), :where([data-xh-ink]), ${INK_SURFACE_CONTENT}, :where([data-scope]) {
${await declarations(transparencyReduce, '      ')}
    }
  }

  /* 减少透明的 DOM 钩子：与系统媒体路径同源。打在局部主题上时，Portal 可把这一轴带到实例壳。
     子树里的主题边界与墨色域会在自己身上重新声明主题取值，钩子要一并命中它们，否则实体替代在那一层被盖回透明 */
  :where([data-transparency='reduce']), :where([data-transparency='reduce'] [data-theme]), :where([data-transparency='reduce'] [data-xh-ink]), :where([data-transparency='reduce'] [data-xh-ink-surface] > *) {
${await declarations(transparencyReduce, '    ')}
  }

  /* 系统强制色拥有最终决定权；组件仍消费同一组材质名，不另开 forced-color 私有分支。
     墨色域会在自己身上重新声明材质取值，这里一并命中 */
  @media (forced-colors: active) {
    :where(:root), :where([data-theme]), :where([data-xh-ink]), ${INK_SURFACE_CONTENT}, :where([data-scope]) {
${await declarations(forcedColors, '      ')}
    }
  }

  /* 减弱动效：排在全部取值块之后，同为零特指度时靠书写顺序压过基线。
     皮肤不必各写各的 @media——只要幅度与时长都引这几个语义令牌，降级自动穿透 */
  @media (prefers-reduced-motion: reduce) {
    :where(:root) {
${await declarations(reduce, '      ')}
    }
  }

  /* 减弱动效的 DOM 钩子：与上面的 @media 块同源同值。打在任意容器上即局部减弱，打在 html 上即全局 */
  :where([data-motion='reduce']) {
${await declarations(reduce)}
  }

  /* 完整动效的 DOM 钩子：系统要求减弱、而应用或局部容器选择完整动效时，恢复减弱档覆盖掉的基线取值。
     排在 @media 块与减弱钩子之后，同为零特指度靠书写顺序取胜；嵌套时元素自身命中的一块压过继承来的值，最近的一层生效 */
  :where([data-motion='default']) {
${await declarations(base.filter(e => reduce.some(r => r.name === e.name)))}
  }

  /* 打印：海拔投影与材质光效取消。皮肤消费的是语义角色，
     角色变 none 就整层不画，皮肤一处都不用改，也不必跟皮肤里的 box-shadow 比特指度——
     那条路走不通：拆层版本里两者按特指度重新竞争，皮肤选择器最深到六个属性，赢不过。
     落点是 [data-scope] 而不是 :root：宿主页面自己的投影归宿主决定，本库只管自己的节点。
     元素上直接命中的声明胜过从祖先继承来的值，与特指度无关，所以这一块压得住上面的取值块 */
  @media print {
    :where([data-scope]) {
${await declarations(print, '      ')}
    }
  }
}
`

  // —— tokens.json / generated.ts（默认=浅色，含 primitive + base + light）——
  const flatMap = {}
  for (const e of [...primitive, ...base, ...lightAll]) flatMap[e.name] = inkDefaults[0].get(e.name) ?? await resolve(e.value, e.type)
  for (const [name, value] of inkAdditions[0])
    flatMap[name] = value

  const generatedTs = `/* eslint-disable */
// AUTO-GENERATED by build/emit-tokens.mjs — do not edit.
export const tokens = ${JSON.stringify(flatMap, null, 2)} as const

export type TokenName = keyof typeof tokens
`

  await writeFile(join(ROOT, 'tokens.css'), applyFileHeader(join(ROOT, 'tokens.css'), css))
  await writeFile(join(ROOT, 'tokens.json'), `${JSON.stringify(flatMap, null, 2)}\n`)
  await mkdir(join(ROOT, 'src', 'generated'), { recursive: true })
  await writeFile(
    join(ROOT, 'src', 'generated', 'tokens.ts'),
    applyFileHeader(join(ROOT, 'src', 'generated', 'tokens.ts'), generatedTs),
  )

  console.log(`[emit-tokens] material recipes ${materials.recipes} × ${materials.targets} modes · shared ${sharedMaterial.length} · primitive ${primitive.length} · base ${base.length} · compact ${compact.length} · light ${light.length} · dark ${dark.length} · transparency ${transparencyReduce.length} · forced-colors ${forcedColors.length} · reduce ${reduce.length} · print ${print.length} → tokens.css / tokens.json / src/generated/tokens.ts`)
}

main()
