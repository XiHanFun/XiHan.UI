#!/usr/bin/env node
// 门禁：可交互控件部件的高度只能来自控件尺度令牌。
//
// 控件高度是跨组件对齐的那把尺：一行里的输入框、下拉、按钮各自凑一个高度，就再也齐不了，
// 而尺一改，凑出来的那个不跟着走。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES_DIR = 'packages/design/styles/css'

/** 受管辖的部件：组件自己那层可交互控件。 */
const CONTROL_PARTS = new Set(['control', 'input', 'trigger', 'preview', 'segment'])

/** 控件尺度令牌：整行控件走 --xh-control-h-*，行内动作按钮走 --xh-control-action-size。 */
const CONTROL_SCALE = /--xh-control-(?:h-[a-z]+|action-size)/

/** 高度属性。多行控件走 min-block-size 同样算数。 */
const HEIGHT_PROPS = new Set(['block-size', 'min-block-size', 'height', 'min-height'])

/** 把高度交给外层控件或内容决定的值，它们本身不带档位。 */
const PASS_THROUGH = new Set(['100%', 'auto', 'inherit', 'unset', 'revert', 'fit-content', 'max-content', 'min-content'])

/**
 * 块尺寸不在控件高度尺上的部件，连同理由。键写成「文件 部件」。
 * 名单之外的控件部件一律受本门禁管辖。
 */
const OFF_SCALE = {
  'slider.css control': '滑轨的块尺寸是拇指直径与竖向轨道长度，与控件行高无关',
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css'))
const problems = []
const usedOffScale = new Set()
let governed = 0

/** 每份皮肤声明过的自定义属性，第二段按全仓口径对账时要回头查。 */
const slotsByFile = new Map()
/** 全仓被高度属性消费到的槽。赋值点与消费点不必在同一份皮肤：子组件的档位由父容器注入是既有形状。 */
const consumed = new Set()

for (const file of files) {
  const comp = file.replace(/\.css$/, '')
  const src = (await readFile(join(STYLES_DIR, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')

  /** 本文件里每个自定义属性声明过的值，用来把组件槽的回退链走通。 */
  const slots = new Map()
  for (const m of src.matchAll(/(--xh-[\w-]+)\s*:\s*([^;}]+)/g))
    slots.set(m[1], [...(slots.get(m[1]) ?? []), m[2].trim()])
  slotsByFile.set(file, slots)

  /** 值本身或它的组件槽回退链上出现过控件尺度令牌。 */
  const onScale = (value, depth = 0) => {
    if (CONTROL_SCALE.test(value))
      return true
    if (depth >= 3)
      return false
    for (const ref of value.matchAll(/var\(\s*(--xh-[\w-]+)/g)) {
      for (const declared of slots.get(ref[1]) ?? []) {
        if (onScale(declared, depth + 1))
          return true
      }
    }
    return false
  }

  // 一、控件部件的高度声明必须落在控件尺度令牌上
  const partRule = new RegExp(`\\[data-scope='${comp}'\\]\\[data-part='([\\w-]+)'\\](?:\\[[^\\]]*\\]|:[\\w-]+(?:\\([^)]*\\))?)*$`)
  for (const rule of src.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const parts = rule[1]
      .split(',')
      .map(sel => sel.trim().replace(/\s+/g, ' ').match(partRule)?.[1])
      .filter(part => part != null && CONTROL_PARTS.has(part))
    if (parts.length === 0)
      continue
    for (const decl of rule[2].matchAll(/(?:^|;|\{)\s*([a-z-]+)\s*:\s*([^;}]+)/g)) {
      if (!HEIGHT_PROPS.has(decl[1]))
        continue
      const value = decl[2].trim()
      for (const part of new Set(parts)) {
        const key = `${file} ${part}`
        if (PASS_THROUGH.has(value) || onScale(value)) {
          governed++
          continue
        }
        if (key in OFF_SCALE) {
          usedOffScale.add(key)
          continue
        }
        problems.push(`${key}  ${decl[1]}: ${value}  —— 没走控件尺度令牌`)
      }
    }
  }

  // 二之一、本份皮肤里被高度属性消费到的槽并进全仓集合
  for (const decl of src.matchAll(/(?:^|;|\{)\s*([a-z-]+)\s*:\s*([^;}]+)/g)) {
    if (!HEIGHT_PROPS.has(decl[1]))
      continue
    for (const ref of decl[2].matchAll(/var\(\s*(--xh-[\w-]+)/g))
      consumed.add(ref[1])
  }
}

// 二之二、沿全仓的回退链再展一轮。Set 的迭代会走到途中追加的项，一轮即可收全
for (const name of consumed) {
  for (const slots of slotsByFile.values()) {
    for (const declared of slots.get(name) ?? []) {
      for (const ref of declared.matchAll(/var\(\s*(--xh-[\w-]+)/g))
        consumed.add(ref[1])
    }
  }
}

// 二之三、用控件高度尺赋值的私有槽，必须真的被某条高度属性消费
for (const [file, slots] of slotsByFile) {
  for (const [name, values] of slots) {
    if (!name.startsWith('--xh-_') || !values.some(v => /--xh-control-h-/.test(v)))
      continue
    if (!consumed.has(name))
      problems.push(`${file}  私有槽 ${name} 拿控件高度尺赋值，却没被任何高度属性消费`)
  }
}

for (const key of Object.keys(OFF_SCALE)) {
  const [file] = key.split(' ')
  if (!files.includes(file))
    problems.push(`${key}：登在不上尺名单里，但这份皮肤已经不在了`)
  else if (!usedOffScale.has(key))
    problems.push(`${key}：登在不上尺名单里，但它已经没有不上尺的高度声明了，删掉这条`)
}

if (problems.length) {
  console.error('[check-control-height] ✗ 控件高度没走同一把尺：')
  for (const p of problems)
    console.error(`  ${p}`)
  console.error('高度写 block-size（多行控件写 min-block-size），值引 --xh-control-h-*，别拿行高或内边距凑。')
  process.exit(1)
}

console.log(`[check-control-height] 通过：${files.length} 份皮肤 · ${governed} 处控件高度都锚在控件尺度令牌上（另有不上尺的 ${usedOffScale.size} 处）`)
