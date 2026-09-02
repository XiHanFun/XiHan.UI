#!/usr/bin/env node
// 门禁：皮肤里的层号只能来自层序令牌 --xh-layer-*，组件内部的相对堆叠除外；
// 浮层的定位层 / 遮罩层还必须先经一个组件覆盖槽再落到层序令牌，槽名后缀统一 -layer。
//
// 裸层号绕开了层序这一处事实源：两个组件各写各的数字，谁盖谁只由数值大小决定，
// 而层序令牌一改，写死的那个不跟着走。
// 定位层 / 遮罩层直引层序令牌则是另一种写死：使用者要把某个浮层单独抬高或压低，
// 只能改全局层序令牌，一改所有同角色的浮层一起动。每个浮层自己的覆盖槽
// `--xh-<组件>-…-layer` 把这个口子留出来，默认值才落到 `--xh-layer-<角色>`。
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

/** 解剖里带这些部件的族，对应部件规则里的 z-index 必须走组件覆盖槽。 */
const LAYERED_PARTS = ['positioner', 'backdrop']

async function read(path) {
  try {
    return await readFile(path, 'utf8')
  }
  catch {
    return null
  }
}

/** 读每个浮层族解剖里登记的定位层 / 遮罩层部件。 */
async function collectLayeredParts() {
  const result = new Map()
  for (const d of await readdir(HEADLESS, { withFileTypes: true })) {
    if (!d.isDirectory())
      continue
    const anatomy = await read(`${HEADLESS}/${d.name}/${d.name}.anatomy.ts`)
    if (!anatomy)
      continue
    const parts = LAYERED_PARTS.filter(p => anatomy.includes(`'${p}'`))
    if (parts.length)
      result.set(d.name, parts)
  }
  return result
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

const layeredParts = await collectLayeredParts()
const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []
const usedWhitelist = new Set()
let tokenised = 0
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
    if (part) {
      const slot = value.match(/^var\(\s*(--xh-[a-z0-9-]+)\s*,\s*var\(\s*--xh-layer-[a-z-]+\s*\)\s*\)$/)
      if (!slot) {
        problems.push(`${at}  —— ${part} 的层号要写成 var(--xh-${comp}-…-layer, var(--xh-layer-<角色>))，直引层序令牌没给使用者留覆盖槽`)
        continue
      }
      if (!slot[1].startsWith(`--xh-${comp}-`) || !slot[1].endsWith('-layer')) {
        problems.push(`${at}  —— ${part} 的覆盖槽要叫 --xh-${comp}-…-layer`)
        continue
      }
      slotted++
      continue
    }
    if (/var\(\s*--xh-layer-/.test(value)) {
      tokenised++
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
  console.error('层序只有 --xh-layer-* 一处事实源；浮层的定位层 / 遮罩层再经 --xh-<组件>-…-layer 槽留给使用者单独调。')
  process.exit(1)
}

console.log(`[check-raw-zindex] 通过：${files.length} 份皮肤 · ${layeredParts.size} 个浮层族的定位层 / 遮罩层 ${slotted} 处层号走覆盖槽 · 另 ${tokenised} 处层号走层序令牌（${usedWhitelist.size} 份皮肤只做组件内堆叠）`)
