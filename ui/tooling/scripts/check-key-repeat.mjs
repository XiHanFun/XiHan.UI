#!/usr/bin/env node
// 门禁：切换类的按键分支必须挡掉键盘自动重复。
//
// 按住一个键不放，浏览器会连着发 keydown。对**幂等**的操作（关闭、跳到端点）无所谓，
// 对**步进**的操作（方向键移动、调尺寸）恰恰是要的；但对**切换**的操作是坏的——
// 全选按住不放会在全选与全不选之间闪，拾起按住不放会反复拾起放下。
//
// 判据：一个 onKeyDown 块里出现了切换类的事件名，块里就必须出现 event.repeat。
// 守卫一律加在 preventDefault 之后：键照样吞掉（不让默认行为漏出去），只是不重复执行。
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'

const SRC = 'packages/engine/headless/src'

/** 非幂等：重复执行会来回翻转或不断累加。 */
const TOGGLE = /TOGGLE|PICKUP|\.DROP|CYCLE|SUBMIT|COMMIT/

/**
 * 明确不挡的：连按就是它的用法。
 * 逐条写明理由——空着的话这张表迟早变成「懒得改就塞进来」的垃圾桶。
 */
const ALLOWED = {
  // 目前没有例外。连按就是用法的（逐格回删、方向键步进）走的都不是切换类事件，
  // 本来就不在上面那条正则里，不必也不该登在这儿
}

async function componentDirs() {
  const out = []
  for (const entry of await readdir(SRC, { withFileTypes: true })) {
    if (entry.isDirectory())
      out.push(entry.name)
  }
  return out.sort()
}

/** 取出每个 onKeyDown 处理器的函数体（按花括号配平）。 */
function keydownBlocks(src) {
  const out = []
  let i = src.indexOf('onKeyDown')
  while (i >= 0) {
    const start = src.indexOf('{', i)
    if (start < 0)
      break
    let depth = 0
    let end = start
    for (; end < src.length; end++) {
      if (src[end] === '{') {
        depth++
      }
      else if (src[end] === '}') {
        depth--
        if (depth === 0)
          break
      }
    }
    out.push(src.slice(start, end + 1))
    i = src.indexOf('onKeyDown', end)
  }
  return out
}

const problems = []
const stale = new Set(Object.keys(ALLOWED))
let guarded = 0

for (const name of await componentDirs()) {
  let src
  try {
    src = await readFile(join(SRC, name, `${name}.connect.ts`), 'utf8')
  }
  catch {
    continue
  }

  for (const block of keydownBlocks(src)) {
    const events = [...block.matchAll(/type: '([A-Z][A-Z_.]*)'/g)].map(m => m[1])
    const toggles = [...new Set(events.filter(e => TOGGLE.test(e)))]
    if (!toggles.length)
      continue
    if (block.includes('.repeat')) {
      guarded++
      continue
    }
    if (ALLOWED[name]) {
      stale.delete(name)
      continue
    }
    problems.push(`  ${name}：keydown 里发 ${toggles.join(' / ')} 却没挡 event.repeat`)
  }
}

for (const name of stale)
  problems.push(`  ${name}：登在放行名单里，但它的 keydown 已经没有切换类事件了，删掉这条`)

if (problems.length) {
  console.error('[check-key-repeat] ✗ 切换类按键没挡住自动重复：')
  console.error(problems.join('\n'))
  console.error('\n按住不放会连发 keydown，切换类操作会来回翻转。')
  console.error('在 preventDefault 之后加 `if (event.repeat) return`——键照样吞掉，只是不重复执行。')
  console.error('连按就是用法的（逐格回删这类）登进本脚本的 ALLOWED 并写明理由。')
  process.exit(1)
}

console.log(`[check-key-repeat] 通过：${guarded} 处切换类按键都挡了自动重复，${Object.keys(ALLOWED).length} 处按连按语义放行`)
