#!/usr/bin/env node
// xihan-icons <svg 目录> [--out 文件] [--dts] [--quiet]
//
// 把任意一个 SVG 目录转成一份 IconRecord 模块，供 XhIcon 直接消费。
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { renderDeclaration, renderModule } from './emit.mjs'
import { ingestIconDir } from './ingest.mjs'

const args = process.argv.slice(2)
function flag(name) {
  return args.includes(name)
}
function value(name, fallback) {
  const at = args.indexOf(name)
  return at === -1 || at + 1 >= args.length ? fallback : args[at + 1]
}

const dir = args.find(arg => !arg.startsWith('--') && args[args.indexOf(arg) - 1] !== '--out')
if (dir === undefined) {
  console.error('用法：xihan-icons <svg 目录> [--out icons.mjs] [--dts] [--quiet]')
  process.exit(1)
}

const out = value('--out', 'icons.mjs')
const quiet = flag('--quiet')

const { icons, skipped } = await ingestIconDir(dir)

if (icons.length === 0) {
  console.error(`[xihan-icons] ${dir} 里一枚都没转成，不写产物`)
  for (const item of skipped.slice(0, 5))
    console.error(`  ${item.file}：${item.reason}`)
  process.exit(1)
}

await mkdir(dirname(out), { recursive: true })
await writeFile(out, renderModule(icons))
if (flag('--dts'))
  await writeFile(out.replace(/\.m?js$/, '.d.mts'), renderDeclaration(icons))

console.log(`[xihan-icons] ${icons.length} 枚 → ${out}${flag('--dts') ? ' + .d.mts' : ''}`)

if (skipped.length > 0) {
  // 转不了的必须报出来：默默少几枚图标，用的人只会以为自己名字写错了
  console.warn(`[xihan-icons] 跳过 ${skipped.length} 枚：`)
  const shown = quiet ? skipped.slice(0, 5) : skipped
  for (const item of shown)
    console.warn(`  ${item.file}：${item.reason}`)
  if (shown.length < skipped.length)
    console.warn(`  …还有 ${skipped.length - shown.length} 枚，去掉 --quiet 看全部`)
}
