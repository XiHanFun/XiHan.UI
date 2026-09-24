#!/usr/bin/env node
// 门禁：每份组件皮肤都要在自己的 scope 上落一个 --xh-<scope>-skin 标记。
//
// 这个标记是 startSkinCheck() 判断「这份皮肤在不在场」的唯一依据。漏一份，那个组件就退回
// 按需引皮肤最难查的那种失效：data-scope / data-part 都在、别的皮肤也加载了，只有它是裸元素，
// 而探测器还一声不吭。
import { readdir, readFile } from 'node:fs/promises'

const DIR = 'packages/design/styles/css'

const errors = []
let checked = 0

for (const file of (await readdir(DIR)).filter(name => name.endsWith('.css')).sort()) {
  const source = await readFile(`${DIR}/${file}`, 'utf8')
  const scope = file.replace(/\.css$/, '')

  // 没有 data-scope 选择器的是基础设施 CSS（层序、reset、语气、排版），不在此列
  if (!source.includes(`[data-scope='${scope}']`))
    continue

  checked++
  if (!source.includes(`--xh-${scope}-skin:`))
    errors.push(`css/${file} 缺皮肤标记：[data-scope='${scope}'] 上要声明 --xh-${scope}-skin`)
}

if (errors.length > 0) {
  console.error('[check-skin-markers] ✗')
  for (const error of errors)
    console.error(`  ${error}`)
  process.exit(1)
}

console.log(`[check-skin-markers] 通过：${checked} 份组件皮肤都带了在场标记`)
