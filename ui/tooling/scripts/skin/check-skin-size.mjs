#!/usr/bin/env node
// 门禁：逐份皮肤的体积不许悄悄涨。
//
// .size-limit.json 里 styles 那条是把 134 份皮肤合起来称一次，单份从 8 kB 涨到 30 kB
// 只要总量没破线就没人知道。本脚本按份登记基线，逐份比对。
//
// 单位是「去掉 /* */ 注释、压掉多余空白后的字节」：table.css 的 36773 字节里有 12877
// 字节是注释，按原始字节算等于罚写注释的人。
//
// 基线表 .size-limit.css.json 由 `pnpm size:css --update` 生成并入库；
// 表两侧都反查：登记了但文件没了、文件在但没登记，都判红。
import { Buffer } from 'node:buffer'
import { readdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const STYLES_DIR = 'packages/design/styles/css'
const TABLE = '.size-limit.css.json'

/** 放宽比例：登记值 × 这个数是红线。 */
const SLACK = 1.10

/** 去注释、压空白后的字节数。 */
function normalizedBytes(css) {
  const body = css
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return Buffer.byteLength(body, 'utf8')
}

const files = (await readdir(STYLES_DIR)).filter(f => f.endsWith('.css')).sort()
const measured = {}
for (const file of files)
  measured[file] = normalizedBytes(await readFile(join(STYLES_DIR, file), 'utf8'))

if (process.argv.includes('--update')) {
  await writeFile(TABLE, `${JSON.stringify(measured, null, 2)}\n`, 'utf8')
  const total = Object.values(measured).reduce((a, b) => a + b, 0)
  console.log(`[size:css] 已写入 ${TABLE}：${files.length} 份皮肤，合计 ${total} 字节（去注释压空白后）`)
  process.exit(0)
}

let baseline
try {
  baseline = JSON.parse(await readFile(TABLE, 'utf8'))
}
catch {
  console.error(`[check-skin-size] ✗ 读不到 ${TABLE}——先跑 pnpm size:css --update 落基线`)
  process.exit(1)
}

const problems = []

for (const [file, bytes] of Object.entries(measured)) {
  if (!(file in baseline)) {
    problems.push(`${file} 没有登记基线——跑 pnpm size:css --update 把它加进 ${TABLE}`)
    continue
  }
  const cap = Math.round(baseline[file] * SLACK)
  if (bytes > cap) {
    const pct = ((bytes / baseline[file] - 1) * 100).toFixed(1)
    problems.push(
      `${file} ${bytes} 字节，登记 ${baseline[file]}（涨 ${pct}%，红线 ${cap}）——`
      + `确实该涨就跑 pnpm size:css --update 重落基线，并在 changeset 里写清涨在哪`,
    )
  }
}

for (const file of Object.keys(baseline)) {
  if (!(file in measured))
    problems.push(`${file} 登记在基线里却找不到这份皮肤——组件改名或退役了就一起改基线`)
}

if (problems.length) {
  console.error('[check-skin-size] ✗ 逐皮肤体积对不上基线：')
  for (const p of problems)
    console.error(`  ${p}`)
  process.exit(1)
}

const total = Object.values(measured).reduce((a, b) => a + b, 0)
const biggest = Object.entries(measured).sort((a, b) => b[1] - a[1])[0]
console.log(
  `[check-skin-size] 通过：${files.length} 份皮肤逐份在基线 ×${SLACK} 以内，`
  + `合计 ${total} 字节（去注释压空白后），最大一份 ${biggest[0]} ${biggest[1]} 字节`,
)
