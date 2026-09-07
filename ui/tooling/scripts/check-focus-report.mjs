#!/usr/bin/env node
// 门禁：离场时的焦点上报必须排在 DOM 摘除之前。
//
// 集合条目被移出 DOM 时浏览器不派 focusout，焦点无声地掉到 body 上，机器那一侧
// 仍记着一个已经不存在的锚点——方向键从不在场的条目起步，容器也不再兜底进 Tab 序列。
// 适配器要在卸载时如实上报，靠的是「本节点当下正持有焦点」这个守卫。
//
// React 对被删子树的 passive 清理排在 DOM 摘除之后，那时 activeElement 已经回到 body，
// 守卫恒不成立，事件一次都发不出去——接线看着还在，全程零报错。所以这类清理只能写在
// layout effect 里。判据：清理函数里读了 getActiveElement 的，必须是 useIsomorphicLayoutEffect
// 或 useLayoutEffect，不许是 useEffect。
//
// 只核 React 适配器。Vue 与 Web Components 不在其列：两者的卸载钩子本就排在节点摘除之前。
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const uiRoot = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const REACT = join(uiRoot, 'packages/adapters/react/src')

/** 递归收 .ts / .tsx。 */
async function sources(dir) {
  const out = []
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await sources(full))
    else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))
      out.push(full)
  }
  return out
}

/** 从 open 处的左括号起做括号配对，返回这一段的结束下标。 */
function blockEnd(source, open) {
  let depth = 0
  for (let i = open; i < source.length; i++) {
    if (source[i] === '(') {
      depth++
    }
    else if (source[i] === ')') {
      depth--
      if (depth === 0)
        return i
    }
  }
  return source.length
}

const files = await sources(REACT)
const problems = []
let guarded = 0

for (const file of files) {
  const source = await readFile(file, 'utf8')
  if (!source.includes('getActiveElement'))
    continue

  for (const hit of source.matchAll(/\b(useEffect|useLayoutEffect|useIsomorphicLayoutEffect)\s*\(/g)) {
    const open = hit.index + hit[0].length - 1
    const body = source.slice(open, blockEnd(source, open) + 1)
    // 只看清理函数那一段：effect 主体里读 activeElement 是另一回事
    const cleanup = body.match(/return\s*\(\)\s*=>\s*\{[\s\S]*\}|\(\)\s*=>\s*\(\)\s*=>\s*\{[\s\S]*\}/)
    if (cleanup == null || !cleanup[0].includes('getActiveElement'))
      continue

    if (hit[1] === 'useEffect') {
      const line = source.slice(0, hit.index).split('\n').length
      problems.push(
        `${relative(uiRoot, file).replaceAll('\\', '/')}:${line}  `
        + '离场上报写在了 useEffect 的清理里——那一步排在 DOM 摘除之后，守卫恒不成立',
      )
    }
    else {
      guarded++
    }
  }
}

if (guarded === 0 && problems.length === 0) {
  console.error('[check-focus-report] ✗ 一处离场上报都没核到——写法变了，这张门禁已经形同虚设')
  process.exit(1)
}

if (problems.length > 0) {
  console.error(`[check-focus-report] ✗ 离场上报排在了 DOM 摘除之后（${problems.length} 处）：`)
  for (const line of problems)
    console.error(`  ${line}`)
  console.error('\n改法：换成 runtime/layout-effect 里的 useIsomorphicLayoutEffect。')
  process.exit(1)
}

console.log(
  `[check-focus-report] 通过：${guarded} 处离场焦点上报都排在 DOM 摘除之前。`
  + 'Vue 与 Web Components 不在其列——两者的卸载钩子本就排在节点摘除之前',
)
