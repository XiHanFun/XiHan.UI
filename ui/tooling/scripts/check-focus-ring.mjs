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

const STYLES = 'packages/design/styles/styles'

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

if (offenders.length) {
  console.error('[check-focus-ring] 聚焦环里有没走令牌的字面量：')
  for (const o of offenders) console.error(`  ${o}`)
  console.error('  粗细用 --xh-ring-width，颜色用 --xh-ring-focus，偏移用 --xh-ring-offset；')
  console.error('  确需往内收就写 calc(-1 * var(--xh-ring-offset))，并在注释里写明为什么。')
  process.exit(1)
}

console.log('[check-focus-ring] 通过：聚焦环的粗细、颜色与偏移全部走令牌')
