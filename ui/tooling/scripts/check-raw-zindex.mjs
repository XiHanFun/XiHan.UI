#!/usr/bin/env node
// 门禁：皮肤里的层号只能来自层序令牌 --xh-layer-*，组件内部的相对堆叠除外；
// 接层序的层号一律先经一个组件覆盖槽再落到层序令牌，槽名后缀统一 -layer。
//
// 裸层号绕开了层序这一处事实源：两个组件各写各的数字，谁盖谁只由数值大小决定，
// 而层序令牌一改，写死的那个不跟着走。
// 直引层序令牌则是另一种写死：使用者要把某一处单独抬高或压低，只能改全局层序令牌，
// 一改所有同角色的一起动。覆盖槽 `--xh-<组件>-…-layer` 把这个口子留出来，
// 默认值才落到 `--xh-layer-<角色>`。
//
// 定位层 / 遮罩层再多受一条：它们排的是页面级层序，不许退回组件内的 0/1/2。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'
const HEADLESS = 'packages/engine/headless/src'

/**
 * 层号只在组件自己的堆叠上下文里比大小、不参与全局层序的皮肤，连同理由。
 * 名单之外的皮肤一律只许引层序令牌。
 */
/**
 * 组件内堆叠名单：登记「这份皮肤的裸层号只在自己内部排序」。
 *
 * 每条都要写明**由哪个部件把这层排序关起来**（isolatedBy）——不写就只是一句自述，
 * 没人核得出真假。判据是那个部件的规则里有 `isolation: isolate`：它建一个层叠上下文，
 * 于是组件内的 0/1/2 既不会被外面的层号插进来，也不会漏到外面去压住别人。
 */
const IN_COMPONENT_STACKING = {
  'avatar-group.css': { reason: '头像相互压边，靠悬停项抬一层盖住相邻头像', isolatedBy: 'root' },
  'button-group.css': { reason: '相邻段的边框重叠，靠悬停段抬一层盖住邻段边框', isolatedBy: 'root' },
  'heatmap.css': { reason: '行首那一列钉住时抬到格子之上，详情条再抬一层压住它', isolatedBy: 'root' },
  'image-viewer.css': { reason: '工具条与关闭钮压在图上，浮层内部的两层', isolatedBy: 'content' },
  'resizable.css': { reason: '把手压在容器边上，四个角再抬一层盖住相邻两条边', isolatedBy: 'root' },
  'table.css': { reason: '粘性列抬到普通单元格之上，表内的列间层序', isolatedBy: 'root' },
  'toggle-group.css': { reason: '条目的边框重叠与选中态抬升，组内三档', isolatedBy: 'root' },
  'watermark.css': { reason: '水印压在内容之上，容器内的两层', isolatedBy: 'root' },
}

/** 组件内堆叠允许的层号档位。 */
const SMALL = new Set(['0', '1', '2'])

/**
 * 排页面级层序的部件名。它们额外多受一条约束：层号必须接上层序，不许退回组件内那三档
 * （0/1/2），哪怕这份皮肤登在组件内堆叠名单里。
 *
 * 这张表只加严、不放行：接层序的那条判据对全部部件一视同仁地查（见下面的主循环）。
 * 从前反过来——只有名字落在这张表里的部件才查，别的部件引层序令牌一律放行；
 * 于是部件一改名，表筛出空集，判据不是判红而是什么都不查。表尾的过期反查钉住这一点。
 */
const LAYERED_PARTS = ['positioner', 'backdrop']

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 读每个浮层族解剖里登记的定位层 / 遮罩层部件；顺带记下哪些名字真被解剖认领过。 */
async function collectLayeredParts() {
  const result = new Map()
  const seen = new Set()
  for (const d of await readdir(HEADLESS, { withFileTypes: true })) {
    if (!d.isDirectory())
      continue
    const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
    if (!anatomy)
      continue
    const parts = LAYERED_PARTS.filter(p => anatomy.includes(`'${p}'`))
    for (const part of parts)
      seen.add(part)
    if (parts.length)
      result.set(d.name, parts)
  }
  return { result, seen }
}

/**
 * 逐行扫描时维护当前所在规则的选择器栈：遇到 `{` 把它前面的选择器文本压栈，
 * 遇到 `}` 弹栈。z-index 声明落在哪个选择器下，就看栈里的文本。
 */
function* declarations(src) {
  const stack = []
  let pending = ''
  const lines = src.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    let rest = line
    while (rest.length) {
      const open = rest.indexOf('{')
      const close = rest.indexOf('}')
      if (open !== -1 && (close === -1 || open < close)) {
        stack.push((pending + rest.slice(0, open)).trim())
        pending = ''
        rest = rest.slice(open + 1)
        continue
      }
      if (close !== -1) {
        const before = rest.slice(0, close)
        const m = before.match(/(?<!-)\bz-index\s*:\s*([^;}]+)/)
        if (m)
          yield { line: i + 1, value: m[1].trim(), selectors: stack.slice() }
        stack.pop()
        pending = ''
        rest = rest.slice(close + 1)
        continue
      }
      const m = rest.match(/(?<!-)\bz-index\s*:\s*([^;}]+)/)
      if (m)
        yield { line: i + 1, value: m[1].trim(), selectors: stack.slice() }
      else if (!/;\s*$/.test(rest) && rest.trim())
        pending += `${rest} `
      rest = ''
    }
  }
}

const { result: layeredParts, seen: layeredPartsSeen } = await collectLayeredParts()
const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []
const usedWhitelist = new Set()
let onLayeredPart = 0
let slotted = 0

/** 文件名 → 去注释后的源码，名单核实那一段复用。 */
const sources = new Map()

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  // 去掉注释但保留它占的行数，报错行号才对得上源文件
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, c => c.replace(/[^\n]/g, ''))
  sources.set(file, src)

  src.split(/\r?\n/).forEach((line, i) => {
    for (const m of line.matchAll(/--xh-[a-z0-9-]+-z(?=\s*[,)])/g))
      problems.push(`${file}:${i + 1}  ${m[0]}  —— 层号槽名后缀统一 -layer，把 -z 改成 -layer`)
  })

  const parts = layeredParts.get(comp) ?? []

  for (const { line, value, selectors } of declarations(src)) {
    const at = `${file}:${line}  z-index: ${value}`
    const scope = selectors.join(' ')
    const part = parts.find(p => new RegExp(`\\[data-part=['"]${p}['"]\\]`).test(scope))
    const where = part ? `${part} 的层号` : '层号'

    // 接上全局层序的，一律先经一个组件覆盖槽：使用者要单独抬高压低某一处浮层，
    // 改的是这个槽；直引层序令牌就只剩「改全局、同角色的一起动」一条路。
    // 这一条对所有部件生效，不看名字——名字表只用来加严（见 LAYERED_PARTS）
    if (/--xh-layer-/.test(value)) {
      const slot = value.match(/^var\(\s*(--xh-[a-z0-9-]+)\s*,\s*var\(\s*--xh-layer-[a-z-]+\s*\)\s*\)$/)
      if (!slot) {
        problems.push(`${at}  —— ${where}要写成 var(--xh-${comp}-…-layer, var(--xh-layer-<角色>))，直引层序令牌没给使用者留覆盖槽`)
        continue
      }
      if (!slot[1].startsWith(`--xh-${comp}-`) || !slot[1].endsWith('-layer')) {
        problems.push(`${at}  —— 覆盖槽要叫 --xh-${comp}-…-layer`)
        continue
      }
      slotted++
      if (part)
        onLayeredPart++
      continue
    }

    // 定位层 / 遮罩层排的是页面级层序，退不回组件内那三档
    if (part) {
      problems.push(`${at}  —— ${part} 排的是页面级层序，层号要写成 var(--xh-${comp}-…-layer, var(--xh-layer-<角色>))，不是组件内的 0/1/2`)
      continue
    }

    const numbers = value.match(/\d+/g) ?? []
    if (numbers.length === 0) {
      problems.push(`${at}  —— 既没引层序令牌，也不是层号`)
      continue
    }
    if (numbers.some(n => n.length >= 3)) {
      problems.push(`${at}  —— 三位数层号一律走 --xh-layer-*`)
      continue
    }
    if (!numbers.every(n => SMALL.has(n))) {
      problems.push(`${at}  —— 只有 0/1/2 算组件内堆叠，别的层号走 --xh-layer-*`)
      continue
    }
    if (!(file in IN_COMPONENT_STACKING)) {
      problems.push(`${at}  —— 要么引 --xh-layer-*，要么把这份皮肤登进组件内堆叠名单并写明理由`)
      continue
    }
    usedWhitelist.add(file)
  }
}

// 名字表的过期反查：改名之后这张表会筛出空集，加严那一条于是悄悄消失
for (const part of LAYERED_PARTS) {
  if (!layeredPartsSeen.has(part)) {
    problems.push(
      `LAYERED_PARTS 里的 '${part}' 在全部解剖里一次都没出现——名单过期了：`
      + `部件改了名，"这个部件排的是页面级层序" 这条加严就筛不到任何皮肤。改成新名字，或删掉这一条`,
    )
  }
}

for (const [file, entry] of Object.entries(IN_COMPONENT_STACKING)) {
  if (!files.includes(file)) {
    problems.push(`${file}：登在组件内堆叠名单里，但这份皮肤已经不在了`)
    continue
  }
  if (!usedWhitelist.has(file)) {
    problems.push(`${file}：登在组件内堆叠名单里，但它已经没有裸层号了，删掉这条`)
    continue
  }
  // 登记里那句「关在自己的层叠上下文里」要能核得出来
  const scope = file.replace(/\.css$/, '')
  const src = sources.get(file) ?? ''
  const isolates = [...src.matchAll(/([^{}]+)\{([^{}]*)\}/g)].some(([, selector, body]) =>
    selector.includes(`[data-part='${entry.isolatedBy}']`) && /isolation:\s*isolate/.test(body))
  if (!isolates) {
    problems.push(
      `${file}：登记说层号关在 ${scope} 的 ${entry.isolatedBy} 里，但那个部件没有 isolation: isolate——`
      + `组件内的 0/1/2 于是与页面上其它层号混在同一个上下文里排序`,
    )
  }
}

if (problems.length) {
  console.error('[check-raw-zindex] ✗ 皮肤里的层号没走层序令牌 / 覆盖槽：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('层序只有 --xh-layer-* 一处事实源；接层序的层号一律再经 --xh-<组件>-…-layer 槽留给使用者单独调。')
  process.exit(1)
}

console.log(`[check-raw-zindex] 通过：${files.length} 份皮肤 · ${slotted} 处接层序的层号全部先经组件覆盖槽（其中 ${onLayeredPart} 处落在 ${layeredParts.size} 个浮层族的定位层 / 遮罩层上）· ${usedWhitelist.size} 份皮肤只做组件内堆叠`)
