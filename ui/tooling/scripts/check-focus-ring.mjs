#!/usr/bin/env node
// 门禁：聚焦环的三件（粗细、颜色、偏移）必须全部走令牌。
//
// 这条不是风格洁癖。聚焦环是无障碍表面：键盘用户全靠它知道自己在哪。
// 一旦某处写了字面量，它就不再随主题走，也不再随「全局把环调粗一点」这类
// 调整生效——而且这种漂移是无声的，肉眼要把整站逐个 Tab 一遍才看得出来。
//
// 真发生过：--xh-ring-offset 声明的是 1px，而 45 份皮肤各自硬编码 2px，
// 库里因此长期有两套聚焦环间距，谁都没发现。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'

const STYLES = 'packages/design/styles/css'

// 允许的写法：直接引令牌，或由令牌算出来（往内收的负偏移）
const TOKEN_DRIVEN = /var\(--xh-[a-z-]+\)/

/**
 * outline 简写里的粗细与颜色、以及 outline-offset 的值。
 *
 * 冒号后不写 \s*：它与 [^;]+ 能吃同一批字符，两边可交换的前缀会让引擎在不匹配时逐位回溯。
 * 值统一交给下面的 trim 归一，正则只负责切出来。
 */
const DECLS = [
  { prop: 'outline-width', re: /^\s*outline-width:([^;]+);/gm },
  { prop: 'outline-color', re: /^\s*outline-color:([^;]+);/gm },
  { prop: 'outline-offset', re: /^\s*outline-offset:([^;]+);/gm },
  { prop: 'outline', re: /^\s*outline:([^;]+);/gm },
]

const offenders = []

for (const file of (await readdir(STYLES)).filter(f => f.endsWith('.css'))) {
  const src = (await readFile(join(STYLES, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  for (const { prop, re } of DECLS) {
    for (const m of src.matchAll(re)) {
      const value = m[1].trim()
      // outline: none / 0 是「明确不画环」，不是环的取值
      if (prop === 'outline' && /^(?:none|0)$/.test(value))
        continue
      if (!TOKEN_DRIVEN.test(value))
        offenders.push(`${file}: ${prop}: ${value}`)
    }
  }
}

// 第二件：带描边的输入类部件，聚焦时的描边色必须走 --xh-border-control-focus（语气槽优先）。
// 描边一律不变只画环、或者描边跟着环色走、或者只画环不管描边——三派并存时，语气轴在
// 「描边跟环色」那一派上整个失效（环与描边都被钉成品牌色）。统一成一派：
// border-color: var(--xh-<c>-<part>-border-focus, var(--xh-_tone, var(--xh-border-control-focus)))，
// 经私有槽中转也行，槽的赋值里得出现 --xh-border-control-focus。环与描边可以拆成两条聚焦规则写。
/** 输入类部件：框本身可聚焦或 focus-within 的那一层。 */
const FOCUS_PARTS = new Set(['control', 'input', 'box', 'textarea'])
/**
 * 部件名不在 FOCUS_PARTS 里、但那一层就是输入框的组件，逐条登记。
 * 这张表是把检查**接上**去，不是放行：条目过期（组件改名、那个部件不再是画描边的那一层）
 * 等于这一家从此不受管辖，且没有任何别的判据会响，所以由下面的名单核验报出来。
 */
const INPUT_LIKE = { composer: 'root' }
const FOCUS_RULE = /\[data-scope='([a-z-]+)'\]\[data-part='([a-z-]+)'\](?:\[[^\]]+\])*:focus-(?:within|visible)(?::not\([^)]*\))?\s*\{([^{}]*)\}/g
const borderFocus = []
/** 真的被这张表接进检查的组件。 */
const usedInputLike = new Set()

for (const file of (await readdir(STYLES)).filter(f => f.endsWith('.css'))) {
  const src = (await readFile(join(STYLES, file), 'utf8')).replace(/\/\*[\s\S]*?\*\//g, '')
  /** 部件 → 它所有聚焦块里的 border-color 取值。 */
  const seen = new Map()
  for (const m of src.matchAll(FOCUS_RULE)) {
    const [, scope, part, body] = m
    if (!(FOCUS_PARTS.has(part) || INPUT_LIKE[scope] === part))
      continue
    // 这个部件有没有描边：基础规则里写了 border 简写或 border-color
    const base = new RegExp(`\\[data-scope='${scope}'\\]\\[data-part='${part}'\\]\\s*\\{([^{}]*)\\}`).exec(src)?.[1] ?? ''
    if (!/(?:^|;|\s)border(?:-color)?:\s*(?!\s|0\b|none\b)/.test(base))
      continue
    if (INPUT_LIKE[scope] === part)
      usedInputLike.add(scope)
    if (!seen.has(part))
      seen.set(part, [])
    const decl = body.match(/border-color:([^;]+);/)?.[1]
    if (decl)
      seen.get(part).push(decl.trim())
  }
  for (const [part, decls] of seen) {
    if (!decls.length) {
      borderFocus.push(`${file}: [${part}] 聚焦块只画了环没写 border-color——带描边的部件聚焦时描边色要走 --xh-border-control-focus`)
      continue
    }
    for (const decl of decls) {
      const slot = decl.match(/var\((--xh-_[a-z0-9-]+)\)/)?.[1]
      const viaSlot = slot && new RegExp(`${slot}:[^;]*--xh-border-control-focus`).test(src)
      if (!/--xh-border-control-focus/.test(decl) && !viaSlot)
        borderFocus.push(`${file}: [${part}] 聚焦块的 border-color: ${decl}——没走 --xh-border-control-focus`)
    }
  }
}

for (const scope of Object.keys(INPUT_LIKE)) {
  if (!usedInputLike.has(scope))
    borderFocus.push(`${scope} 的 ${INPUT_LIKE[scope]} 登记在 INPUT_LIKE 里却没被扫到——名单过期了，这一家已经不受聚焦描边判据管辖`)
}

if (offenders.length || borderFocus.length) {
  if (offenders.length) {
    console.error('[check-focus-ring] 聚焦环里有没走令牌的字面量：')
    for (const o of offenders) console.error(`  ${o}`)
    console.error('  粗细用 --xh-ring-width，颜色用 --xh-ring-focus，偏移用 --xh-ring-offset；')
    console.error('  确需往内收就写 calc(-1 * var(--xh-ring-offset))，并在注释里写明为什么。')
  }
  if (borderFocus.length) {
    console.error('[check-focus-ring] 聚焦态描边色没统一：')
    for (const o of borderFocus) console.error(`  ${o}`)
  }
  process.exit(1)
}

console.log(`[check-focus-ring] 通过：聚焦环的粗细、颜色与偏移全部走令牌；带描边的输入部件聚焦时描边色都走 --xh-border-control-focus（另接 ${usedInputLike.size} 家非标准部件名）`)
