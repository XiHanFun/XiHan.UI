#!/usr/bin/env node
// 门禁：适配器源码里的内联样式不许写设计字面量。
//
// 命令式服务（对话框、消息条、加载条）与反馈模板是在渲染函数里拼 DOM 的，写内联样式
// 绕不开。绕不开不等于可以写死值：40 道皮肤门禁一条都扫不到适配器，一旦这里出现
// `gap: '8px'` 或 `color: '#fff'`，密度轴、语气轴、减弱动效对它全部失效，而且没有任何
// 检查会报——上一轮就是这么让反馈徽记的旋转停在 0.8s 上、令牌层的 reduce 通道对它无效。
//
// 判据：内联样式里出现设计量（长度 / 颜色 / 时长）时，取值必须整段来自 var(--xh-…)。
// 布局关键字（flex / grid / none / center 之类）与纯数字（zIndex、opacity、flex）不在此列。
import { readdir, readFile } from 'node:fs/promises'
import { extname, join } from 'node:path'

const ADAPTERS = 'packages/adapters'

/** 会承载设计量的属性名（驼峰，内联样式的写法）。 */
const DESIGN_PROPS = new RegExp(
  `^(?:${[
    'inlineSize', 'blockSize', 'width', 'height', 'minInlineSize', 'maxInlineSize', 'minBlockSize', 'maxBlockSize',
    'padding[A-Za-z]*', 'margin[A-Za-z]*', 'gap', 'rowGap', 'columnGap', 'inset[A-Za-z]*', 'top', 'right', 'bottom', 'left',
    'borderRadius', 'border[A-Za-z]*Radius', 'borderWidth', 'border[A-Za-z]*Width', 'outlineWidth', 'outlineOffset',
    'color', 'background[A-Za-z]*', 'borderColor', 'border[A-Za-z]*Color', 'outlineColor', 'fill', 'stroke', 'boxShadow',
    'fontSize', 'lineHeight', 'letterSpacing', 'fontWeight', 'fontFamily',
    'transitionDuration', 'animationDuration', 'transitionDelay', 'animationDelay', 'transition', 'animation',
  ].join('|')})$`,
)

/** 设计字面量：带单位的长度、颜色、时长。 */
const LITERAL = /(?:^|[\s(,])(?:-?\d*\.?\d+(?:px|rem|em|vh|vw|ch|ex|s|ms|deg)|#[0-9a-f]{3,8}\b|\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\()/i

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'tests')
      continue
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      yield* walk(full)
    else if (['.ts', '.tsx'].includes(extname(entry.name)))
      yield full
  }
}

const problems = []
let scanned = 0
let checked = 0

for await (const file of walk(ADAPTERS)) {
  scanned += 1
  const src = (await readFile(file, 'utf8')).replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
  src.split('\n').forEach((line, i) => {
    if (line.trim().startsWith('//'))
      return
    // 对象字面量里的 `prop: '值'`／`prop: "值"`／`prop: \`值\``；第 2 组是引号本身，值在第 3 组
    for (const [, prop, , value] of line.matchAll(/([A-Za-z][A-Za-z]*)\s*:\s*(['"`])((?:(?!\2).)*)\2/g)) {
      if (!DESIGN_PROPS.test(prop))
        continue
      checked += 1
      if (!LITERAL.test(value))
        continue
      // 整段都在 var() 里的算合规（含 calc 里套 var 的几何推导）
      if (/var\(--xh-/.test(value))
        continue
      problems.push(`${file}:${i + 1}  ${prop}: ${JSON.stringify(value)}`)
    }
  })
}

if (problems.length) {
  console.error('[check-adapter-inline-style] ✗ 适配器的内联样式写了设计字面量：')
  for (const problem of problems)
    console.error(`  ${problem}`)
  console.error('\n改成 var(--xh-…)：皮肤门禁扫不到适配器，写死的值会让密度、语气、减弱动效对它全部失效。')
  process.exit(1)
}

console.log(`[check-adapter-inline-style] 通过：扫描 ${scanned} 个适配器源文件，${checked} 处内联的设计属性都走令牌`)
